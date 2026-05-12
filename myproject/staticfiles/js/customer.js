document.addEventListener('DOMContentLoaded', function () {
    // --- 1. Configuration & Elements ---
    const menuItems = {
        'dashboard': document.querySelector('.menu-item-dashboard'),
        'settings': document.querySelector('.menu-item-settings')
    };
    const mainContent = document.querySelector('.Content');
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
        'dashboard': '/customer/dashboard-content/',
        'settings': '/customer/settings/'
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
            // Remove active from all nav items
            document.querySelectorAll('.nav-item').forEach(el => {
                if (el) el.classList.remove('active');
            });
            // Add active to the selected menu item
            if (menuItems[activeKey]) {
                menuItems[activeKey].classList.add('active');
            }
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

                // Re-execute scripts inside the new HTML (needed for filters)
                mainContent.querySelectorAll('script').forEach(oldScript => {
                    const newScript = document.createElement('script');
                    Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                    newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                });

                // CRITICAL: Fetch the Data for the page that just loaded
                if (url.includes('dashboard') || url.includes('dashboard-content')) {
                    if (typeof initCustomerDashboard === 'function') {
                        initCustomerDashboard();
                    }
                }
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
                // Update active state
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                if (menuItems[key]) {
                    menuItems[key].classList.add('active');
                }
                loadContent(contentRoutes[key]);
            });
        }
    });
    
    // Set initial active state
    if (menuItems['dashboard']) {
        menuItems['dashboard'].classList.add('active');
    }

    if (signOutBtn) {
        signOutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to sign out?')) {
                // Try to use Django logout URL if available, otherwise use log_in
                try {
                    window.location.href = '/log_in/';
                } catch (e) {
                    window.location.href = '/log_in/';
                }
            }
        });
    }

    // --- 4. Event Delegation (Handles ALL dynamic links) ---
    if (mainContent) {
        mainContent.addEventListener('click', function (event) {
            const link = event.target.closest('a, button');
            if (!link) return;

            // Check if it is a dynamic link
            const href = link.getAttribute('href');
            const isDynamic = link.classList.contains('ajax-link') ||
                (link.tagName === 'A' && href && (
                    href.includes('/edit/') ||
                    href.includes('/create/')
                ));

            // Handle Ajax links
            if (isDynamic || link.classList.contains('ajax-link')) {
                event.preventDefault();
                const url = href || link.getAttribute('data-url');
                if (url) loadContent(url);
            }
        });

        // Form Submission Event Delegation
        mainContent.addEventListener('submit', function (event) {
            const form = event.target;
            if (form.classList.contains('ajax-form') || form.hasAttribute('data-ajax')) {
                event.preventDefault();
                submitFormAjax(form);
            }
        });
    }

    // Helper function for AJAX form submission
    function submitFormAjax(form) {
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        }

        fetch(form.action || form.getAttribute('data-action'), {
            method: 'POST',
            body: formData,
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(res => {
                const contentType = res.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return res.json();
                } else {
                    return res.text().then(text => ({ html: text }));
                }
            })
            .then(data => {
                if (data.success) {
                    if (data.redirect) {
                        loadContent(data.redirect);
                    } else {
                        // Reload current page
                        const currentUrl = window.location.pathname;
                        loadContent(currentUrl);
                    }
                } else {
                    // If validation fails, render the HTML with errors
                    if (data.html) {
                        mainContent.innerHTML = data.html;
                    } else {
                        alert('Error: ' + (data.error || 'Unknown error'));
                    }
                }
            })
            .catch(err => {
                console.error('Form submission error:', err);
                alert('An error occurred. Please try again.');
            })
            .finally(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            });
    }

    // Data Initializers
    function initDashboard() {
        console.log("Initializing Customer Dashboard...");
        // The dashboard template has its own initCustomerDashboard function
        // which will be called when the script in the template executes
    }

    // Expose loadContent globally
    window.loadContent = loadContent;
    
    // Expose initDashboard for external calls
    window.initDashboard = initDashboard;

    // Initial Load - Load dashboard content when page first loads
    if (mainContent) {
        const currentContent = mainContent.innerHTML.trim();
        if (currentContent === '' || currentContent === '<div style="padding:40px; text-align:center; color:#666;">Loading content...</div>') {
            loadContent(contentRoutes['dashboard']);
        }
    }
});

