
document.addEventListener('DOMContentLoaded', function() {
    let homeLink = document.querySelector('.menu-item-home');
    let routesLink = document.querySelector('.menu-item-routes');
    let historyLink = document.querySelector('.menu-item-history');
    let notificationLink = document.querySelector('.menu-item-notification');
    let signOutBtn = document.querySelector('.sign-out');
    let mainContent = document.querySelector('.main-content');

    // Define content routes mapping
    const contentRoutes = {
        'home': '/driver_home/',
        'routes': '/driver_routes/',
        'history': '/driver_history/',
        'notification': '/driver_notifications/',
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
        })
        .catch(error => {
            console.error('Error loading content:', error);
            mainContent.innerHTML = '<p>Error loading content. Please try again.</p>';
        });
    }

    // Event Listeners
    if (homeLink) {
        homeLink.addEventListener('click', function(event) {
            event.preventDefault();
            setActiveMenuItem('home');
            loadContent(contentRoutes['home']);
        });
    }

    if (routesLink) {
        routesLink.addEventListener('click', function(event) {
            event.preventDefault();
            setActiveMenuItem('routes');
            loadContent(contentRoutes['routes']);
        });
    }

    if (historyLink) {
        historyLink.addEventListener('click', function(event) {
            event.preventDefault();
            setActiveMenuItem('history');
            loadContent(contentRoutes['history']);
        });
    }

    if (notificationLink) {
        notificationLink.addEventListener('click', function(event) {
            event.preventDefault();
            setActiveMenuItem('notification');
            loadContent(contentRoutes['notification']);
        });
    }

    if (signOutBtn) {
        signOutBtn.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = '/log_in/';
        });
    }

    // Load home content on initial page load
    if (mainContent.innerHTML.trim() === '') {
        loadContent(contentRoutes['home']);
    }
});
