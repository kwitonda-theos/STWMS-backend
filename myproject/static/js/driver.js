
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
    function setActiveMenuItem(routeKey) {
        // Remove active class from all menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        // Add active class to the clicked menu item
        // Map route keys to menu item class names
        const menuItemMap = {
            'home': 'menu-item-home',
            'routes': 'menu-item-routes',
            'history': 'menu-item-history',
            'notification': 'menu-item-notification'
        };
        const menuItemClass = menuItemMap[routeKey];
        if (menuItemClass) {
            const menuItem = document.querySelector(`.${menuItemClass}`);
            if (menuItem) {
                menuItem.classList.add('active');
            }
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
            // After loading content, fetch and update dynamic data
            if (url.includes('driver_home')) {
                updateDriverStats();
                updateDriverRoutes();
                updateDriverNotifications();
                // Set up auto-refresh for home page
                startAutoRefresh();
            } else if (url.includes('driver_routes')) {
                updateRoutesPage();
                // Set up auto-refresh for routes page
                startAutoRefresh();
            } else {
                stopAutoRefresh();
            }
        })
        .catch(error => {
            console.error('Error loading content:', error);
            mainContent.innerHTML = '<p>Error loading content. Please try again.</p>';
        });
    }

    // Auto-refresh interval
    let refreshInterval = null;

    function startAutoRefresh() {
        // Clear existing interval
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
        // Refresh data every 30 seconds
        refreshInterval = setInterval(() => {
            updateDriverStats();
            updateDriverRoutes();
            updateDriverNotifications();
            // If on routes page, update it too
            if (document.getElementById('collection-stops-list')) {
                updateRoutesPage();
            }
        }, 30000);
    }

    function stopAutoRefresh() {
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
    }

    // Fetch and update driver stats
    function updateDriverStats() {
        fetch('/api/driver/stats/', {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            // Update stats boxes
            const pendingBox = document.querySelector('.stats .box:nth-child(1) .num');
            const completedBox = document.querySelector('.stats .box:nth-child(2) .num');
            const progressBox = document.querySelector('.stats .box:nth-child(3) .num');
            
            if (pendingBox) pendingBox.textContent = data.pending_collections || 0;
            if (completedBox) completedBox.textContent = data.completed_today || 0;
            if (progressBox) progressBox.textContent = (data.route_progress || 0) + '%';
        })
        .catch(error => console.error('Error fetching stats:', error));
    }

    // Fetch and update driver routes
    function updateDriverRoutes() {
        fetch('/api/driver/routes/', {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            const stopsContainer = document.querySelector('.stops');
            if (!stopsContainer || !data.routes || data.routes.length === 0) return;
            
            // Get first route (today's active route)
            const route = data.routes[0];
            if (!route || !route.bins) return;
            
            // Update stops list
            const stopsList = stopsContainer.querySelector('.stop')?.parentElement;
            if (stopsList) {
                // Clear existing stops (keep the h3)
                const h3 = stopsList.querySelector('h3');
                stopsList.innerHTML = '';
                if (h3) stopsList.appendChild(h3);
                
                // Add bins as stops
                route.bins.slice(0, 3).forEach((bin, index) => {
                    const stopDiv = document.createElement('div');
                    stopDiv.className = 'stop';
                    const status = bin.status === 'full' ? 'pending' : 'completed';
                    const statusText = bin.status === 'full' ? 'Pending' : 'Completed';
                    stopDiv.innerHTML = `
                        <p><strong>${bin.location}</strong>${index === 0 ? ' — Up next' : ''}</p>
                        <span class="${status}">${statusText}</span>
                    `;
                    stopsList.appendChild(stopDiv);
                });
            }
        })
        .catch(error => console.error('Error fetching routes:', error));
    }

    // Fetch and update driver notifications
    function updateDriverNotifications() {
        fetch('/api/driver/notifications/', {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            // Update notification badge
            const badge = document.querySelector('.notification-badge');
            if (badge) {
                badge.textContent = data.unread_count || 0;
                badge.style.display = data.unread_count > 0 ? 'flex' : 'none';
            }
            
            // Update notifications list on home page
            const notificationsSection = document.querySelector('.notifications');
            if (notificationsSection && data.notifications) {
                const notesContainer = notificationsSection.querySelector('.note-title')?.parentElement;
                if (notesContainer) {
                    // Clear existing notes (keep h2 and note-title)
                    const h2 = notesContainer.querySelector('h2');
                    const noteTitle = notesContainer.querySelector('.note-title');
                    const button = notesContainer.querySelector('.navigate-to-notifications');
                    
                    notesContainer.innerHTML = '';
                    if (h2) notesContainer.appendChild(h2);
                    if (noteTitle) notesContainer.appendChild(noteTitle);
                    
                    // Add notifications (max 3)
                    data.notifications.slice(0, 3).forEach(notif => {
                        const noteDiv = document.createElement('div');
                        noteDiv.className = 'note';
                        const alertText = notif.type === 'bin_full' ? 'New full bin assigned:' : 
                                        notif.type === 'sensor_error' ? 'Sensor error detected:' :
                                        'Alert:';
                        noteDiv.innerHTML = `
                            <span class="badge ${notif.priority}">${notif.priority.charAt(0).toUpperCase() + notif.priority.slice(1)}</span>
                            <p><strong>${alertText}</strong> ${notif.location}</p>
                            <small>${notif.time_ago}</small>
                        `;
                        notesContainer.appendChild(noteDiv);
                    });
                    
                    if (button) notesContainer.appendChild(button);
                }
            }
        })
        .catch(error => console.error('Error fetching notifications:', error));
    }

    // Update routes page with collection stops
    function updateRoutesPage() {
        const stopsListEl = document.getElementById('collection-stops-list');
        if (!stopsListEl) {
            console.warn('Collection stops list element not found');
            return;
        }

        // Show loading state
        stopsListEl.innerHTML = '<li class="stop-item" style="text-align: center; padding: 20px; color: #666;">Loading collection stops...</li>';

        fetch('/api/driver/routes/', {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Routes API response:', data);
            
            // Check if there's an error in the response
            if (data.error) {
                throw new Error(data.error);
            }

            // Update remaining stops count
            const remainingStopsEl = document.getElementById('remaining-stops');
            if (remainingStopsEl) {
                const remaining = data.remaining_count !== undefined ? data.remaining_count : (data.total_count || 0) - (data.completed_count || 0);
                remainingStopsEl.textContent = remaining > 0 ? `Remaining ${remaining} stops` : 'All stops completed!';
            }

            // Update stops summary
            const stopsSummaryEl = document.getElementById('stops-summary');
            if (stopsSummaryEl) {
                const completed = data.completed_count || 0;
                const total = data.total_count || 0;
                stopsSummaryEl.textContent = total > 0 ? `${completed} of ${total} stops completed` : 'No stops assigned';
            }

            // Update route progress
            const routeProgressEl = document.getElementById('route-progress');
            if (routeProgressEl) {
                const completed = data.completed_count || 0;
                const total = data.total_count || 0;
                const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
                routeProgressEl.textContent = `${progress}%`;
            }

            // Update total stops
            const totalStopsEl = document.getElementById('total-stops');
            if (totalStopsEl) {
                totalStopsEl.textContent = data.total_count || 0;
            }

            // Update collection stops list
            const allStops = data.all_stops || [];
            
            if (allStops.length === 0) {
                stopsListEl.innerHTML = '<li class="stop-item" style="text-align: center; padding: 20px; color: #666;">No collection stops assigned for today.</li>';
            } else {
                stopsListEl.innerHTML = '';
                
                allStops.forEach((stop, index) => {
                    const stopItem = document.createElement('li');
                    stopItem.className = `stop-item ${stop.is_collected ? 'completed' : 'pending'}`;
                    
                    const statusText = stop.is_collected ? 'Completed' : 'Pending';
                    const statusClass = stop.is_collected ? 'status completed' : 'status pending';
                    
                    stopItem.innerHTML = `
                        <span>${stop.location || 'Unknown location'}</span>
                        <span class="${statusClass}">${statusText}</span>
                    `;
                    
                    // Add click handler to mark as complete if not completed
                    if (!stop.is_collected) {
                        stopItem.style.cursor = 'pointer';
                        stopItem.title = 'Click to mark as complete';
                        stopItem.addEventListener('click', function() {
                            if (confirm(`Mark collection at ${stop.location} as complete?`)) {
                                markCollectionComplete(stop.id, stop.route_id);
                            }
                        });
                    }
                    
                    stopsListEl.appendChild(stopItem);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching routes for routes page:', error);
            const stopsListEl = document.getElementById('collection-stops-list');
            const remainingStopsEl = document.getElementById('remaining-stops');
            const stopsSummaryEl = document.getElementById('stops-summary');
            
            if (stopsListEl) {
                stopsListEl.innerHTML = '<li class="stop-item" style="text-align: center; padding: 20px; color: #dc3545;">Error loading collection stops: ' + error.message + '</li>';
            }
            if (remainingStopsEl) {
                remainingStopsEl.textContent = 'Error loading stops';
            }
            if (stopsSummaryEl) {
                stopsSummaryEl.textContent = 'Error loading data';
            }
        });
    }

    // Mark collection as complete
    function markCollectionComplete(binId, routeId) {
        fetch('/api/driver/complete-collection/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                bin_id: binId,
                route_id: routeId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Refresh data
                updateDriverStats();
                updateDriverRoutes();
                // If on routes page, update it too
                if (document.getElementById('collection-stops-list')) {
                    updateRoutesPage();
                }
                alert('Collection marked as complete!');
            } else {
                alert('Error: ' + (data.error || 'Failed to mark collection as complete'));
            }
        })
        .catch(error => {
            console.error('Error marking collection complete:', error);
            alert('Error marking collection as complete');
        });
    }

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

    // Event delegation for dynamically loaded buttons
    document.addEventListener('click', function(event) {
        // Handle "View routes" button click
        if (event.target.classList.contains('navigate-to-routes')) {
            event.preventDefault();
            setActiveMenuItem('routes');
            loadContent(contentRoutes['routes']);
        }
        
        // Handle "View all notifications" button click
        if (event.target.classList.contains('navigate-to-notifications')) {
            event.preventDefault();
            setActiveMenuItem('notification');
            loadContent(contentRoutes['notification']);
        }
    });

    // Load home content on initial page load
    if (mainContent.innerHTML.trim() === '') {
        loadContent(contentRoutes['home']);
    }
});
