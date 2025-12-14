// Wait for DOM to be fully loaded before executing
document.addEventListener('DOMContentLoaded', function() {
    let overviewLink = document.querySelector('.menu-item-overview');
    let tankStatusLink = document.querySelector('.menu-item-tank_status');
    let vehiclesLink = document.querySelector('.menu-item-vehicles');
    let analyticsLink = document.querySelector('.menu-item-analytics');
    let settingsLink = document.querySelector('.menu-item-settings');
    let signOutBtn = document.querySelector('.sign-out');
    let mainContent = document.querySelector('.main-content');
    
    if (vehiclesLink) {
        vehiclesLink.addEventListener('click', function(event) {
            event.preventDefault();
            setActiveMenuItem('vehicles');
            loadContent('/vehicles/');
        });
    }

    // Define content routes
    const contentRoutes = {
        'overview': '/overview/',
        'tank_status': '/tank_status/',
        'analytics': '/analytics/',
        'settings': '/settings/',
    };

    // Function to set active menu item
    function setActiveMenuItem(selector) {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        const menuItem = document.querySelector(`a.${selector}`)?.closest('.menu-item');
        if (menuItem) {
            menuItem.classList.add('active');
        }
    }

    // Function to load content dynamically
    function loadContent(url) {
        fetch(url, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load content');
                }
                return response.text();
            })
            .then(html => {
                mainContent.innerHTML = html;
                
                // Execute any scripts in the loaded HTML
                const scripts = mainContent.querySelectorAll('script');
                scripts.forEach(function(oldScript) {
                    const newScript = document.createElement('script');
                    Array.from(oldScript.attributes).forEach(attr => {
                        newScript.setAttribute(attr.name, attr.value);
                    });
                    newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                });
            })
            .catch(error => {
                console.error('Error loading content:', error);
                mainContent.innerHTML = '<p>Error loading content. Please try again.</p>';
            });
    }

    if (overviewLink) {
        overviewLink.addEventListener('click', function(event) {
            event.preventDefault();
            setActiveMenuItem('overview');
            loadContent(contentRoutes['overview']);
        });
    }

    if (tankStatusLink) {
        tankStatusLink.addEventListener('click', function(event) {
            event.preventDefault();
            setActiveMenuItem('tank_status');
            loadContent(contentRoutes['tank_status']);
        });
    }

    if (analyticsLink) {
        analyticsLink.addEventListener('click', function(event) {
            event.preventDefault();
            setActiveMenuItem('analytics');
            loadContent(contentRoutes['analytics']);
        });
    }

    if (settingsLink) {
        settingsLink.addEventListener('click', function(event) {
            event.preventDefault();
            setActiveMenuItem('settings');
            loadContent(contentRoutes['settings']);
        });
    }

    if (signOutBtn) {
        signOutBtn.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = '/log_in/';
        });
    }

    // Load overview content on page load
    if (mainContent.innerHTML.trim() === '') {
        loadContent(contentRoutes['overview']);
    }
    // Create Bin and Create Vehicle links - use event delegation for dynamically added buttons
    if (mainContent) {
        mainContent.addEventListener('click', function(event) {
            const createBinBtn = event.target.closest('.create-tank');
            if (createBinBtn) {
                event.preventDefault();
                loadContent('/bins/create/');
                return;
            }
            const createVehicleBtn = event.target.closest('.create-vehicle');
            if (createVehicleBtn) {
                event.preventDefault();
                loadContent('/vehicles/create/');
                return;
            }
            
        });
    }

    
    // Define global functions for form navigation (available even before scripts execute)
    window.loadBinForm = function() {
        loadContent('/bins/create/');
    };

    window.loadLocationForm = function() {
        loadContent('/locations/create/');
    };

    window.loadTankStatus = function() {
        loadContent('/tank_status/');
    };
    window.loadVehicleList = function() {
        
        loadContent('/vehicles/');
    }

    // ... existing code ...

    // Event Delegation for dynamic content in main-content
    if (mainContent) {
        mainContent.addEventListener('click', function(event) {
            // 1. Handle "Create Vehicle" / "Create Tank" buttons 
            const createBtn = event.target.closest('.create-vehicle, .create-tank');
            if (createBtn) {
                event.preventDefault();
                loadContent(createBtn.getAttribute('href'));
                return;
            }

            // 2. Handle "Edit" links in the table/grid
            // We look for any <a> tag with 'btn' class that points to an edit URL
            const editLink = event.target.closest('a.btn');
            if (editLink && editLink.getAttribute('href').includes('/edit/')) {
                event.preventDefault();
                loadContent(editLink.getAttribute('href'));
                return;
            }
        });
    }

    // ... existing submit handler ...

    // AJAX Form Submission Handler
    if (mainContent) {
        mainContent.addEventListener('submit', function(event) {
            const form = event.target;
            
            // Check if this is the vehicle form or a delete form
            if (form.id === 'vehicle-create-form' || (form.action && form.action.includes('delete'))) {
                event.preventDefault(); // Stop normal submission
                
                const formData = new FormData(form);
                const url = form.action;
                const submitBtn = form.querySelector('button[type="submit"]');
                
                // Add loading state
                if(submitBtn) {
                    var originalText = submitBtn.innerHTML;
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = 'Saving...';
                }

                fetch(url, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                .then(response => {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        return response.json().then(data => {
                            // If it is JSON, return it with a flag
                            return { isJson: true, data: data };
                        });
                    } else {
                        // If it is HTML (likely validation errors), return text
                        return response.text().then(html => {
                            return { isJson: false, html: html };
                        });
                    }
                })
                .then(result => {
                    if (result.isJson) {
                        // SUCCESS: The server said "success": true
                        if (result.data.success) {
                            // Reload the Vehicle List
                            loadContent('/vehicles/'); 
                        } else {
                            // Handle logic errors if any
                            alert('Operation failed.');
                            if(submitBtn) {
                                submitBtn.disabled = false;
                                submitBtn.innerHTML = originalText;
                            }
                        }
                    } else {
                        // ERROR/VALIDATION: The server returned HTML (the form with errors)
                        mainContent.innerHTML = result.html;

                        // Re-initialize scripts in the returned HTML
                        const scripts = mainContent.querySelectorAll('script');
                        scripts.forEach(function(oldScript) {
                            const newScript = document.createElement('script');
                            Array.from(oldScript.attributes).forEach(attr => {
                                newScript.setAttribute(attr.name, attr.value);
                            });
                            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                            oldScript.parentNode.replaceChild(newScript, oldScript);
                        });
                    }
                })
                .catch(error => {
                    console.error('Error submitting form:', error);
                    alert('An error occurred. Please try again.');
                    if(submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalText;
                    }
                });
            }
        });
    }
});