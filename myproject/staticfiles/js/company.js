// Filter functions - Define globally before DOMContentLoaded to ensure they're always available
window.filterTanks = function () {
    const input = document.getElementById('tankSearch');
    if (!input) {
        console.warn('tankSearch input not found');
        return;
    }
    const filter = input.value.toLowerCase();
    const cards = document.querySelectorAll('.tank-card');
    console.log(`Filtering ${cards.length} tank cards with filter: "${filter}"`);
    cards.forEach(card => {
        const cardText = card.textContent.toLowerCase();
        const shouldShow = filter === '' || cardText.includes(filter);
        if (shouldShow) {
            card.classList.remove('filtered-out');
        } else {
            card.classList.add('filtered-out');
        }
    });
};

window.filterStatus = function (selectedStatus) {
    const cards = document.querySelectorAll('.tank-card');
    console.log(`Filtering ${cards.length} tank cards by status: "${selectedStatus}"`);
    cards.forEach(card => {
        const cardStatus = card.getAttribute('data-status');
        if (selectedStatus === 'all' || cardStatus === selectedStatus) {
            card.classList.remove('filtered-out');
        } else {
            card.classList.add('filtered-out');
        }
    });
};

window.filterVehicles = function () {
    const input = document.getElementById('vehicleSearch');
    if (!input) {
        console.warn('vehicleSearch input not found');
        return;
    }
    const filter = input.value.toLowerCase();
    const cards = document.querySelectorAll('.vehicle-card');
    console.log(`Filtering ${cards.length} vehicle cards with filter: "${filter}"`);
    cards.forEach(card => {
        const cardText = card.textContent.toLowerCase();
        const shouldShow = filter === '' || cardText.includes(filter);
        if (shouldShow) {
            card.classList.remove('filtered-out');
        } else {
            card.classList.add('filtered-out');
        }
    });
};

document.addEventListener('DOMContentLoaded', function () {
    // Load saved theme on page load
    const settings = getSettings();
    applyTheme(settings.theme);

    // --- 1. Configuration & Elements ---
    const menuItems = {
        'overview': document.querySelector('.menu-item-overview'),
        'tank_status': document.querySelector('.menu-item-tank_status'),
        'vehicles': document.querySelector('.menu-item-vehicles'),
        'analytics': document.querySelector('.menu-item-analytics'),
        'settings': document.querySelector('.menu-item-settings')
    };
    const mainContent = document.querySelector('.main-content');
    const signOutBtn = document.querySelector('.sign-out');

    // Mobile Menu Toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function toggleMobileMenu() {
        if (sidebar && sidebarOverlay) {
            sidebar.classList.toggle('mobile-open');
            sidebarOverlay.classList.toggle('active');
        }
    }

    function closeMobileMenu() {
        if (sidebar && sidebarOverlay) {
            sidebar.classList.remove('mobile-open');
            sidebarOverlay.classList.remove('active');
        }
    }

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeMobileMenu);
    }

    const sidebarClose = document.getElementById('sidebarClose');
    if (sidebarClose) {
        sidebarClose.addEventListener('click', closeMobileMenu);
    }

    // Close mobile menu when clicking on menu items
    Object.values(menuItems).forEach(item => {
        if (item) {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    closeMobileMenu();
                }
            });
        }
    });

    // Close mobile menu on window resize if screen becomes larger
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });

    const contentRoutes = {
        'overview': '/overview/',
        'tank_status': '/tank_status/',
        'vehicles': '/vehicles/',
        'analytics': '/analytics/',
        'settings': '/settings/'
    };

    // 2. Content Loading Logic 
    window.loadContent = function (url) {
        // Highlight the correct Sidebar Item
        let activeKey = null;
        for (const [key, route] of Object.entries(contentRoutes)) {
            if (url.includes(key) || url.includes(key.replace('_', ''))) {
                activeKey = key;
                break;
            }
        }
        if (activeKey) {
            Object.values(menuItems).forEach(el => { if (el) el.classList.remove('active'); });
            if (menuItems[activeKey]) menuItems[activeKey].classList.add('active');
        }

        // Show loading text
        mainContent.innerHTML = '<div style="padding:40px; text-align:center; color:#666;">Loading content...</div>';

        // Fetch the HTML Page
        fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.text();
            })
            .then(html => {
                mainContent.innerHTML = html;

                //  Re-execute scripts inside the new HTML (needed for filters)
                mainContent.querySelectorAll('script').forEach(oldScript => {
                    const newScript = document.createElement('script');
                    Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                    newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                });

                // CRITICAL: Fetch the Data for the page that just loaded
                if (url.includes('overview')) initOverview();
                if (url.includes('tank_status')) initTankStatus();
                if (url.includes('vehicles')) initVehicleList();
                if (url.includes('settings')) {
                    if (typeof window.initSettings === 'function') {
                        window.initSettings();
                    }
                }
            })
            .catch(error => {
                console.error('Error loading content:', error);
                mainContent.innerHTML = '<div style="padding:20px; color:red;">Error loading content. Please try again.</div>';
            });
    };

    // --- 3. Sidebar Click Listeners ---
    Object.keys(menuItems).forEach(key => {
        if (menuItems[key]) {
            menuItems[key].addEventListener('click', (e) => {
                e.preventDefault();
                loadContent(contentRoutes[key]);
            });
        }
    });

    if (signOutBtn) {
        signOutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/log_in/';
        });
    }

    // --- 4. Event Delegation (Handles ALL dynamic links: Create, Edit, Back) ---
    if (mainContent) {
        mainContent.addEventListener('click', function (event) {
            const link = event.target.closest('a, button');
            if (!link) return;

            // Handle delete tank button
            if (link.classList.contains('delete-tank-btn') || link.closest('.delete-tank-btn')) {
                event.preventDefault();
                const deleteBtn = link.classList.contains('delete-tank-btn') ? link : link.closest('.delete-tank-btn');
                const binId = deleteBtn.getAttribute('data-bin-id');

                if (binId && confirm('Are you sure you want to delete this tank? This action cannot be undone.')) {
                    deleteBtn.disabled = true;
                    deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';

                    fetch(`/bins/${binId}/delete/`, {
                        method: 'POST',
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-CSRFToken': getCookie('csrftoken')
                        }
                    })
                        .then(response => {
                            if (response.ok) {
                                // Reload tank status page
                                loadContent('/tank_status/');
                            } else {
                                throw new Error('Delete failed');
                            }
                        })
                        .catch(error => {
                            console.error('Error deleting tank:', error);
                            alert('Error deleting tank. Please try again.');
                            deleteBtn.disabled = false;
                            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
                        });
                }
                return;
            }

            // Handle delete vehicle button
            if (link.classList.contains('delete-vehicle-btn') || link.closest('.delete-vehicle-btn')) {
                event.preventDefault();
                const deleteBtn = link.classList.contains('delete-vehicle-btn') ? link : link.closest('.delete-vehicle-btn');
                const vehicleId = deleteBtn.getAttribute('data-vehicle-id');

                if (vehicleId && confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
                    deleteBtn.disabled = true;
                    deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';

                    fetch(`/vehicles/${vehicleId}/delete/`, {
                        method: 'POST',
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-CSRFToken': getCookie('csrftoken')
                        }
                    })
                        .then(response => {
                            if (response.ok) {
                                // Reload vehicle list page
                                loadContent('/vehicles/');
                            } else {
                                throw new Error('Delete failed');
                            }
                        })
                        .catch(error => {
                            console.error('Error deleting vehicle:', error);
                            alert('Error deleting vehicle. Please try again.');
                            deleteBtn.disabled = false;
                            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
                        });
                }
                return;
            }

            // Check if it is a dynamic link
            const isDynamic = link.classList.contains('create-vehicle') ||
                link.classList.contains('create-tank') ||
                (link.tagName === 'A' && link.getAttribute('href') && link.getAttribute('href').includes('/edit/')) ||
                (link.tagName === 'A' && link.getAttribute('href') && link.getAttribute('href').includes('/create/'));

            // Handle "Back" buttons or explicitly marked Ajax links
            if (isDynamic || link.classList.contains('ajax-link')) {
                event.preventDefault();
                const url = link.getAttribute('href') || link.getAttribute('data-url');
                if (url) loadContent(url);
            }
        });

        // 5. Filter Input Event Delegation (for dynamically loaded content)
        mainContent.addEventListener('input', function (event) {
            if (event.target.id === 'tankSearch') {
                window.filterTanks();
            } else if (event.target.id === 'vehicleSearch') {
                window.filterVehicles();
            }
        });

        mainContent.addEventListener('change', function (event) {
            if (event.target.classList.contains('form-select') && event.target.closest('.panel-controls')) {
                const select = event.target;
                // Check if it's the status filter by checking if it has status options
                const options = Array.from(select.options).map(opt => opt.value);
                if (options.includes('all') && options.includes('full') && options.includes('empty')) {
                    window.filterStatus(select.value);
                }
            }
        });

        // 5. Form Submission (Create/Edit Vehicles and Locations) 
        mainContent.addEventListener('submit', function (event) {
            const form = event.target;

            // Only intercept specific forms
            if (form.id === 'vehicle-create-form') {
                event.preventDefault();
                const formData = new FormData(form);
                const submitBtn = form.querySelector('button[type="submit"]');

                if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = 'Saving...'; }

                fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'X-Requested-With': 'XMLHttpRequest' }
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            // Reload the list on success
                            if (data.redirect) loadContent(data.redirect);
                            else loadContent('/vehicles/');
                        } else {
                            // If validation fails, render the HTML with errors
                            if (data.html) mainContent.innerHTML = data.html;
                            else alert('Error saving vehicle');
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        // Reload list if it was actually a success but parsed wrong, otherwise alert
                        alert('An error occurred or the response was not JSON.');
                        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'Save'; }
                    });
            } else if (form.id === 'createLocationForm') {
                event.preventDefault();
                submitLocationForm();
            } else if (form.id === 'bin-create-form') {
                event.preventDefault();
                submitBinForm();
            } else if (form.id === 'assignTaskForm') {
                event.preventDefault();
                submitAssignTaskForm();
            }
        });
    }

    // 6. Global Functions 
    window.loadVehicleList = function () { loadContent('/vehicles/'); };
    window.loadTankStatus = function () { loadContent('/tank_status/'); };
    window.loadCreateBinForm = function () { loadContent('/bins/create/'); };
    window.loadCreateLocationForm = function () { loadContent('/company/location/create/'); };

    // Bin Form Submission
    window.submitBinForm = function () {
        const form = document.getElementById('bin-create-form');
        if (!form) {
            console.error('Bin form not found');
            return;
        }

        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="button"][onclick*="submitBinForm"]');

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        }

        fetch('/bins/create/', {
            method: 'POST',
            body: formData,
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(res => {
                // Check if response is JSON or HTML
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return res.json();
                } else {
                    return res.text().then(text => ({ html: text }));
                }
            })
            .then(data => {
                if (data.success) {
                    // On success, redirect to tank status
                    if (data.redirect) {
                        loadContent(data.redirect);
                    } else {
                        loadTankStatus();
                    }
                } else {
                    // If validation fails, render the HTML with errors
                    if (data.html) {
                        mainContent.innerHTML = data.html;
                    } else {
                        alert('Error creating tank. Please check the form fields.');
                    }
                }
            })
            .catch(err => {
                console.error('Bin form submission error:', err);
                alert('An error occurred while creating the tank.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-save"></i> Create Tank';
                }
            });
    };

    // Location Form Submission
    window.submitLocationForm = function () {
        const form = document.getElementById('createLocationForm');
        if (!form) {
            console.error('Location form not found');
            return;
        }

        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="button"][onclick*="submitLocationForm"]');

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        }

        fetch('/locations/create/', {
            method: 'POST',
            body: formData,
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(res => {
                // Check if response is JSON or HTML
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return res.json();
                } else {
                    return res.text().then(text => ({ html: text }));
                }
            })
            .then(data => {
                if (data.success) {
                    // On success, redirect back to bin form
                    if (data.redirect_to === 'bin_create') {
                        loadCreateBinForm();
                    } else {
                        loadContent('/locations/');
                    }
                } else {
                    // If validation fails, render the HTML with errors
                    if (data.html) {
                        mainContent.innerHTML = data.html;
                    } else {
                        alert('Error saving location');
                    }
                }
            })
            .catch(err => {
                console.error('Location form submission error:', err);
                alert('An error occurred while saving the location.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Location';
                }
            });
    };

    // Assign Task Form Submission
    window.submitAssignTaskForm = function () {
        const form = document.getElementById('assignTaskForm');
        if (!form) {
            console.error('Assign Task form not found');
            return;
        }

        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Assigning...';
        }

        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(res => {
                const contentType = res.headers.get('content-type');
                
                // Check if response is JSON (success)
                if (contentType && contentType.includes('application/json')) {
                    return res.json().then(data => {
                        if (data.success) {
                            // Success - load overview in main-content
                            loadContent('/overview/');
                            return null;
                        } else {
                            // Error in JSON response
                            alert('Error: ' + (data.error || 'Unknown error'));
                            if (submitBtn) {
                                submitBtn.disabled = false;
                                submitBtn.innerHTML = 'Assign Task';
                            }
                            return null;
                        }
                    });
                }
                
                // Otherwise, it's HTML (form with errors or error response)
                return res.text().then(html => {
                    if (res.ok || res.status === 400) {
                        // Update content with form (may have errors)
                        mainContent.innerHTML = html;
                    } else {
                        alert('An error occurred while assigning the task.');
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = 'Assign Task';
                        }
                    }
                });
            })
            .catch(err => {
                console.error('Assign Task form submission error:', err);
                alert('An error occurred while assigning the task.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Assign Task';
                }
            });
    };


    // 7. Data Initializers 

    function initOverview() {
        console.log("Initializing Overview...");
        fetch('/api/overview-stats/')
            .then(res => res.json())
            .then(data => {
                safeSetText('stat-total-bins', data.total_bins);
                safeSetText('stat-total-trucks', data.total_trucks);
                safeSetText('stat-urgent', data.urgent_collections);
                safeSetText('stat-efficiency', (data.efficiency || 0) + '%');

                const container = document.getElementById('recent-alerts-list');
                if (container && data.recent_alerts) {
                    if (data.recent_alerts.length === 0) {
                        container.innerHTML = '<p style="color:#888;">No recent alerts.</p>';
                    } else {
                        container.innerHTML = data.recent_alerts.map(a =>
                            `<div class="alert-item" style="padding:10px 30px; border-bottom:1px solid #eee;">
                                <div class="alert-left">
                                    <svg width="15" height="15" fill="#fa3e3e" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
                                    <div style="display:flex; flex-direction:column;">
                                        <strong>${a.bin_id || 'Bin'}</strong>
                                        <span>${a.alert_type.replace('_', ' ')}</span>
                                    </div>
                                </div>
                                <span style="float:right; color:#888; font-size:0.8em;">${new Date(a.timestamp).toLocaleTimeString()}</span>
                             </div>`
                        ).join('');
                    }
                }
            })
            .catch(e => console.error("Overview API Error:", e));
    }

    function updateTankStats(data) {
        if (!data || data.length === 0) {
            document.getElementById('stat-total-tanks').textContent = '0';
            document.getElementById('stat-attention').textContent = '0';
            document.getElementById('stat-almost-full').textContent = '0';
            document.getElementById('stat-normal').textContent = '0';
            return;
        }

        let totalTanks = 0; // Count only non-maintenance tanks
        let attentionCount = 0; // Full tanks (>=90%)
        let almostFullCount = 0; // Intermediate tanks (>=50% and <90%)
        let normalCount = 0; // Empty tanks (<50%)

        data.forEach(bin => {
            const fillLevel = bin.fill_level ? Number(bin.fill_level) : 0;
            const status = bin.status ? bin.status.toLowerCase() : 'unknown';

            // Skip maintenance tanks from calculations
            if (status === 'maintenance') {
                return;
            }

            // Count this tank in the total (since it's not maintenance)
            totalTanks++;

            if (fillLevel >= 90) {
                attentionCount++;
            } else if (fillLevel >= 50) {
                almostFullCount++;
            } else {
                normalCount++;
            }
        });

        // Update the dashboard stats
        document.getElementById('stat-total-tanks').textContent = totalTanks;
        document.getElementById('stat-attention').textContent = attentionCount;
        document.getElementById('stat-almost-full').textContent = almostFullCount;
        document.getElementById('stat-normal').textContent = normalCount;
    }

    function initTankStatus() {
        console.log("Initializing Tanks...");
        const grid = document.getElementById('tankGrid');
        if (!grid) return;

        grid.innerHTML = '<p style="text-align:center; width:100%; color:#888;">Loading tanks...</p>';

        fetch('/api/tanks/')
            .then(res => res.json())
            .then(data => {
                // Update dashboard stats
                updateTankStats(data);

                grid.innerHTML = '';
                if (!data || data.length === 0) {
                    grid.innerHTML = '<div class="no-data"><p>No waste bins found.</p></div>';
                    return;
                }
                data.forEach(bin => {
                    const fillLevel = bin.fill_level ? Number(bin.fill_level) : 0;

                    // Status 
                    let displayStatus = bin.status ? bin.status.toLowerCase() : 'unknown';
                    let badgeClass = 'status-active';
                    if (displayStatus !== 'maintenance') {
                        if (fillLevel >= 90) { displayStatus = 'full'; badgeClass = 'status-full'; }
                        else if (fillLevel >= 50) { displayStatus = 'intermediate'; badgeClass = 'status-almost'; }
                        else { displayStatus = 'empty'; badgeClass = 'status-active'; }
                    } else { badgeClass = 'status-maintenance'; }

                    // Location 
                    const loc = bin.location_details || bin.location || {};
                    let sector = loc.sector || loc.district || 'Unassigned';
                    let house = loc.house ? `House: ${loc.house}` : '';
                    // Fill Level 
                    let fillClass = fillLevel >= 90 ? 'fill-critical' : (fillLevel >= 50 ? 'fill-warning' : 'fill-safe');

                    const card = document.createElement('div');
                    card.className = 'stat-card tank-card';
                    card.setAttribute('data-status', displayStatus);
                    card.innerHTML = `
                        <div class="tank-header">
                            <div class="tank-id"><i class="fas fa-trash-alt"></i> <span>${bin.WasteBin_id || 'N/A'}</span></div>
                            <span class="status-badge ${badgeClass}">${displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}</span>
                        </div>
                        <div class="tank-location"><p><i class="fas fa-map-marker-alt"></i> ${sector}</p><small>${house}</small></div>
                        <div class="fill-level-container">
                            <div class="fill-info"><span>Fill Level</span><strong>${fillLevel.toFixed(0)}%</strong></div>
                            <div class="progress-bg"><div class="progress-fill ${fillClass}" style="width: ${fillLevel}%;"></div></div>
                        </div>
                        <div class="tank-footer">
                            <span>Last updated: ${bin.last_updated ? new Date(bin.last_updated).toLocaleDateString() : 'Never'}</span>
                            <button class="delete-tank-btn" data-bin-id="${bin.WasteBin_id}" style="margin-left: 10px; padding: 5px 10px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85em; transition: background-color 0.2s;">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    `;
                    grid.appendChild(card);
                });
            })
            .catch(e => console.error("Tank API Error:", e));
    }

    // Expose initTankStatus globally for onclick handlers
    window.initTankStatus = initTankStatus;

    function initVehicleList() {
        console.log("Initializing Vehicles...");
        const grid = document.getElementById('vehicleGrid');
        if (!grid) return;

        grid.innerHTML = '<p style="text-align:center; width:100%; color:#888;">Loading vehicles...</p>';

        fetch('/api/vehicles/')
            .then(res => res.json())
            .then(data => {
                grid.innerHTML = '';
                if (!data || data.length === 0) {
                    grid.innerHTML = '<div class="no-data"><p>No vehicles found.</p></div>';
                    return;
                }
                data.forEach(vehicle => {
                    // Location details
                    const loc = vehicle.current_location_details || {};
                    let sector = loc.sector || loc.district || 'Unassigned';
                    let house = loc.house ? `House: ${loc.house}` : '';

                    // Driver/Collector
                    const driver = vehicle.assigned_collector_name || 'Unassigned';

                    // Capacity
                    const capacity = vehicle.capacity ? Number(vehicle.capacity).toFixed(2) : '0.00';

                    const card = document.createElement('div');
                    card.className = 'stat-card vehicle-card';
                    card.innerHTML = `
                        <div class="tank-header">
                            <div class="tank-id"><i class="fas fa-truck"></i> <span>${vehicle.plate_number || 'N/A'}</span></div>
                            <span class="status-badge status-active">Active</span>
                        </div>
                        <div class="tank-location">
                            <p><i class="fas fa-map-marker-alt"></i> ${sector}</p>
                            <small>${house}</small>
                        </div>
                        <div class="fill-level-container">
                            <div class="fill-info">
                                <span>Capacity</span>
                                <strong>${capacity} L</strong>
                            </div>
                        </div>
                        <div class="driver-section" style="margin: 15px 0; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">
                            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem;">
                                <i class="fas fa-user" style="color: #10B981;"></i>
                                <span><strong>Driver:</strong> ${driver}</span>
                            </div>
                        </div>
                        <div class="tank-footer">
                            <div style="display: flex; gap: 10px;">
                                <a href="/vehicles/${vehicle.id}/edit/" class="btn btn-sm btn-outline ajax-link" style="padding: 5px 15px; font-size: 0.9em; text-decoration: none; border: none; border-radius: 5px; cursor: pointer; background-color: #006325; color: white;font-weight: 600; font-family: 'Jost', sans-serif;">
                                    <i class="fas fa-edit"></i> Edit
                                </a>
                                <button class="delete-vehicle-btn" data-vehicle-id="${vehicle.id}" style="padding: 5px 15px; font-size: 0.9em; text-decoration: none; border: none; border-radius: 5px; cursor: pointer; background-color: #dc3545; color: white;font-weight: 600; font-family: 'Jost', sans-serif;">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    `;
                    grid.appendChild(card);
                });
            })
            .catch(e => console.error("Vehicle API Error:", e));
    }

    function safeSetText(id, val) { const el = document.getElementById(id); if (el) el.innerText = val || 0; }

    // Helper function to get CSRF token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Settings Management
    window.initSettings = function () {
        // Load saved settings
        loadSettings();

        // Set up auto-refresh if enabled
        setupAutoRefresh();
    };

    // Initial Load
    if (mainContent.innerHTML.trim() === '') loadContent(contentRoutes['overview']);
});

// Settings Functions - Global scope
window.toggleSetting = function (toggleElement) {
    toggleElement.classList.toggle('active');
    const settingName = toggleElement.getAttribute('data-setting');
    const isActive = toggleElement.classList.contains('active');

    // Save to localStorage
    const settings = getSettings();
    settings.notifications[settingName] = isActive;
    saveSettings(settings);

    // Show feedback
    showSettingFeedback(settingName, isActive);
};

window.changeTheme = function (theme) {
    const settings = getSettings();
    settings.theme = theme;
    saveSettings(settings);
    applyTheme(theme);
    showSettingFeedback('theme', theme);
};

window.changeLanguage = function (language) {
    const settings = getSettings();
    settings.language = language;
    saveSettings(settings);
    showSettingFeedback('language', language);
    // Note: Full language implementation would require backend support
    alert(`Language preference saved: ${language}. Full translation requires page reload.`);
};

window.changeRefreshInterval = function (interval) {
    const settings = getSettings();
    settings.refreshInterval = parseInt(interval);
    saveSettings(settings);
    setupAutoRefresh();
    showSettingFeedback('refreshInterval', `${interval}s`);
};

// Settings Storage Functions
function getSettings() {
    const defaultSettings = {
        notifications: {
            binOverflowAlerts: true,
            routeOptimization: true,
            maintenanceReminders: true,
            dailyReports: false
        },
        theme: 'light',
        language: 'english',
        refreshInterval: 60
    };

    const saved = localStorage.getItem('stwms_settings');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            return { ...defaultSettings, ...parsed };
        } catch (e) {
            console.error('Error parsing settings:', e);
        }
    }
    return defaultSettings;
}

function saveSettings(settings) {
    localStorage.setItem('stwms_settings', JSON.stringify(settings));
}

function loadSettings() {
    const settings = getSettings();

    // Load notification toggles
    Object.keys(settings.notifications).forEach(key => {
        const toggle = document.querySelector(`[data-setting="${key}"]`);
        if (toggle) {
            if (settings.notifications[key]) {
                toggle.classList.add('active');
            } else {
                toggle.classList.remove('active');
            }
        }
    });

    // Load saved theme
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
        themeSelect.value = settings.theme;
        applyTheme(settings.theme);
    }

    // Load language
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.value = settings.language;
    }

    // Load refresh interval
    const refreshSelect = document.getElementById('refresh-interval-select');
    if (refreshSelect) {
        refreshSelect.value = settings.refreshInterval.toString();
    }
}

function applyTheme(theme) {
    const body = document.body;
    const html = document.documentElement;

    // Remove existing theme classes
    body.classList.remove('theme-light', 'theme-dark');
    html.classList.remove('theme-light', 'theme-dark');

    if (theme === 'auto') {
        // Use system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = prefersDark ? 'dark' : 'light';
    }

    if (theme === 'dark') {
        body.classList.add('theme-dark');
        html.classList.add('theme-dark');
    } else {
        body.classList.add('theme-light');
        html.classList.add('theme-light');
    }
}

let autoRefreshInterval = null;

function setupAutoRefresh() {
    // Clear existing interval
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }

    const settings = getSettings();
    const interval = settings.refreshInterval * 1000; // Convert to milliseconds

    // Only set up auto-refresh if we're on a page that needs it
    autoRefreshInterval = setInterval(() => {
        const currentUrl = window.location.pathname;
        const mainContent = document.querySelector('.main-content');

        if (mainContent) {
            // Check what page we're on and refresh accordingly
            if (currentUrl.includes('tank_status') || mainContent.innerHTML.includes('Tank Status')) {
                if (typeof initTankStatus === 'function') {
                    initTankStatus();
                }
            } else if (currentUrl.includes('vehicles') || mainContent.innerHTML.includes('Vehicle Fleet')) {
                if (typeof initVehicleList === 'function') {
                    initVehicleList();
                }
            } else if (currentUrl.includes('overview') || mainContent.innerHTML.includes('Overview')) {
                if (typeof initOverview === 'function') {
                    initOverview();
                }
            }
        }
    }, interval);
}

function showSettingFeedback(setting, value) {
    
    console.log(`Setting "${setting}" changed to: ${value}`);
}

// Initialize settings when settings page loads
document.addEventListener('DOMContentLoaded', function () {
    // Check if we're on the settings page
    if (document.querySelector('.setting-item') || document.getElementById('theme-select')) {
        window.initSettings();
    }

    // Also initialize when content is loaded dynamically
    const observer = new MutationObserver(function (mutations) {
        if (document.querySelector('.setting-item') || document.getElementById('theme-select')) {
            window.initSettings();
        }
    });

    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        observer.observe(mainContent, { childList: true, subtree: true });
    }
});