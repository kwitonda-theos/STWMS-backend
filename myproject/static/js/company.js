// Wait for DOM to be fully loaded before executing
document.addEventListener('DOMContentLoaded', function() {
    let overviewLink = document.querySelector('.menu-item-overview');
    let tankStatusLink = document.querySelector('.menu-item-tank_status');
    let analyticsLink = document.querySelector('.menu-item-analytics');
    let settingsLink = document.querySelector('.menu-item-settings');
    let signOutBtn = document.querySelector('.sign-out');
    let mainContent = document.querySelector('.main-content');
    let createBinLink = document.querySelector('.create-tank');

    // Define content routes
    const contentRoutes = {
        'overview': '/overview/',
        'tank_status': '/tank_status/',
        'analytics': '/analytics/',
        'settings': '/settings/',
        'bin_create': '/bins/create/',
        // Add more routes as needed

        
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
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load content');
                }
                return response.text();
            })
            .then(html => {
                mainContent.innerHTML = html;
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
            // Add logout logic here or redirect to login page
            window.location.href = '/log_in/';
        });
    }

    // Load overview content on page load
    if (mainContent.innerHTML.trim() === '') {
        loadContent(contentRoutes['overview']);
    }
    // Create Bin link
    if (createBinLink) {
        createBinLink.addEventListener('click', function(event) {
            event.preventDefault();
            console.log('Create Bin link clicked');
        });
    }
});