
console.log('driver.js loaded');

// Default performance data for history page (global scope)
const DEFAULT_PERFORMANCE = {
    collection_rate: 60,
    efficiency: 75,
    total_collections: 85,
    total_weight: 1250.5
};

// Global function for tab clicks (accessible from onclick attributes)
// Must be defined in global scope, not inside DOMContentLoaded
window.handleTabClick = function(btn, period) {
    console.log('=== handleTabClick called ===');
    console.log('Button:', btn);
    console.log('Period:', period);
    
    // Force remove active from all buttons
    const allButtons = document.querySelectorAll('.tab-btn');
    console.log('Found', allButtons.length, 'tab buttons');
    allButtons.forEach(b => {
        b.classList.remove('active');
    });
    
    // Force add active to clicked button - CSS will handle the green color
    btn.classList.add('active');
    console.log('Button styled - should be green now');
    
    // Update title based on period
    const titleElement = document.getElementById('collections-title');
    console.log('Title element:', titleElement);
    const titles = {
        'today': "Today's Collections",
        'week': "This Week's Collections",
        'month': "This Month's Collections"
    };
    if (titleElement) {
        titleElement.textContent = titles[period] || "Collections";
        console.log('Title updated to:', titles[period]);
    } else {
        console.error('Title element not found!');
    }
    
    // Load data for selected period - call loadHistory if available
    console.log('Calling loadHistory with period:', period);
    if (window.loadHistoryFunction) {
        window.loadHistoryFunction(period);
    } else {
        console.error('loadHistoryFunction not available!');
        // Try to fetch directly
        fetch(`/api/driver/history/?period=${period}`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(response => response.json())
        .then(data => {
            console.log('History data received:', data);
            const list = document.getElementById('collection-list');
            if (list) {
                if (data.collections && data.collections.length > 0) {
                    list.innerHTML = data.collections.map(c => 
                        `<div class="collection-item"><div class="item-main"><div class="status-dot completed-dot"></div><span class="location">${c.location}</span><span class="details type">Collection</span><span class="details time">${c.time}</span></div><div class="item-stats"><span class="stat-value">${c.estimated_weight} kg</span></div></div>`
                    ).join('');
                } else {
                    list.innerHTML = '<div class="no-collections"><p>No collection yet</p></div>';
                }
            }
        })
        .catch(error => {
            console.error('Error loading history:', error);
            const list = document.getElementById('collection-list');
            if (list) {
                list.innerHTML = '<div class="no-collections"><p>No collection yet</p></div>';
            }
        });
    }
};

console.log('handleTabClick function defined globally');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded fired');
    let homeLink = document.querySelector('.menu-item-home');
    let routesLink = document.querySelector('.menu-item-routes');
    let historyLink = document.querySelector('.menu-item-history');
    let notificationLink = document.querySelector('.menu-item-notification');
    let signOutBtn = document.querySelector('.sign-out');
    let mainContent = document.querySelector('.main-content');
    
    console.log('Elements found:', {
        homeLink: !!homeLink,
        routesLink: !!routesLink,
        historyLink: !!historyLink,
        notificationLink: !!notificationLink,
        signOutBtn: !!signOutBtn,
        mainContent: !!mainContent
    });

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
            } else if (url.includes('driver_history')) {
                // Initialize history page functionality
                console.log('History page detected, calling initializeHistoryPage');
                initializeHistoryPage();
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


    // Initialize history page functionality
    function initializeHistoryPage() {
        console.log('=== initializeHistoryPage called ===');
        let currentPeriod = 'today';
        
        // Check if buttons exist
        const tabButtons = document.querySelectorAll('.tab-btn');
        console.log('Found', tabButtons.length, 'tab buttons on initialization');
        tabButtons.forEach((btn, i) => {
            console.log(`Button ${i}:`, btn, 'data-period:', btn.getAttribute('data-period'));
        });
        
        // Load initial data
        console.log('Loading initial history data for:', currentPeriod);
        loadHistory(currentPeriod);
        
        console.log('History page initialized. Tab buttons should work via onclick handlers.');
    }

    // Load history data - expose globally
    function loadHistory(period) {
        console.log('=== loadHistory called ===');
        console.log('Period:', period);
        
        // Show loading state
        const list = document.getElementById('collection-list');
        console.log('Collection list element:', list);
        if (list) {
            list.innerHTML = '<div class="no-collections"><p>Loading...</p></div>';
            console.log('Set loading state');
        } else {
            console.error('Collection list element not found!');
        }
        
        const url = `/api/driver/history/?period=${period}`;
        console.log('Fetching from URL:', url);
        
        fetch(url, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            console.log('Response received:', response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('History data received:', data);
            console.log('Collections:', data.collections);
            console.log('Performance:', data.performance);
            updateCollectionsList(data.collections || [], period);
            // Use performance data from API or defaults
            const performance = data.performance || DEFAULT_PERFORMANCE;
            console.log('Using performance data:', performance);
            updatePerformanceMetrics(performance);
        })
        .catch(error => {
            console.error('=== Error loading history ===');
            console.error('Error details:', error);
            console.error('Error message:', error.message);
            const list = document.getElementById('collection-list');
            if (list) {
                list.innerHTML = '<div class="no-collections"><p>No collection yet</p></div>';
            }
            // Use default performance data on error
            updatePerformanceMetrics(DEFAULT_PERFORMANCE);
        });
    }
    
    // Expose loadHistory globally so handleTabClick can call it
    window.loadHistoryFunction = loadHistory;

    // Update collections list
    function updateCollectionsList(collections, period) {
        const list = document.getElementById('collection-list');
        const title = document.getElementById('collections-title');
        
        // Update title based on period
        const titles = {
            'today': "Today's Collections",
            'week': "This Week's Collections",
            'month': "This Month's Collections"
        };
        if (title) {
            title.textContent = titles[period] || "Collections";
        }
        
        if (!list) return;
        
        if (collections.length === 0) {
            list.innerHTML = '<div class="no-collections"><p>No collection yet</p></div>';
            return;
        }
        
        list.innerHTML = collections.map(collection => {
            // Determine quality based on fill level
            let quality = 'good';
            let qualityText = 'Good';
            if (collection.fill_level >= 90) {
                quality = 'good';
                qualityText = 'Excellent';
            } else if (collection.fill_level >= 50) {
                quality = 'average';
                qualityText = 'Good';
            } else {
                quality = 'low';
                qualityText = 'Fair';
            }
            
            return `
                <div class="collection-item">
                    <div class="item-main">
                        <div class="status-dot completed-dot"></div>
                        <span class="location">${collection.location}</span>
                        <span class="details type">Collection</span>
                        <span class="details time">${collection.time}</span>
                    </div>
                    <div class="item-stats">
                        <span class="stat-value">${collection.estimated_weight} kg</span>
                        <span class="stat-value quality ${quality}">${qualityText}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Update performance metrics
    function updatePerformanceMetrics(performance) {
        // Use defaults if performance is missing
        if (!performance) {
            performance = DEFAULT_PERFORMANCE;
        }
        
        // Update collection rate
        const rateBar = document.getElementById('collection-rate-bar');
        const rateValue = document.getElementById('collection-rate-value');
        if (rateBar && rateValue) {
            const rate = performance.collection_rate || DEFAULT_PERFORMANCE.collection_rate;
            rateBar.style.width = rate + '%';
            rateValue.textContent = rate + '%';
        }
        
        // Update efficiency
        const efficiencyBar = document.getElementById('efficiency-bar');
        const efficiencyValue = document.getElementById('efficiency-value');
        if (efficiencyBar && efficiencyValue) {
            const efficiency = performance.efficiency || DEFAULT_PERFORMANCE.efficiency;
            efficiencyBar.style.width = efficiency + '%';
            efficiencyValue.textContent = efficiency + '%';
        }
        
        // Update total collections
        const totalCollections = document.getElementById('total-collections');
        if (totalCollections) {
            const total = performance.total_collections || DEFAULT_PERFORMANCE.total_collections;
            totalCollections.textContent = total;
        }
        
        // Update total weight
        const totalWeight = document.getElementById('total-weight');
        if (totalWeight) {
            const weight = performance.total_weight || DEFAULT_PERFORMANCE.total_weight;
            totalWeight.textContent = weight + ' kg';
        }
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
    console.log('Setting up event delegation');
    document.addEventListener('click', function(event) {
        console.log('Click detected on:', event.target, 'Classes:', event.target.className, 'Tag:', event.target.tagName);
        
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
        
        // Handle history tab button clicks - check if clicked element or its parent has tab-btn class
        const tabBtn = event.target.closest('.tab-btn');
        if (tabBtn) {
            event.preventDefault();
            event.stopPropagation();
            console.log('Tab clicked via delegation:', tabBtn.getAttribute('data-period'));
            console.log('Button element:', tabBtn);
            
            // Force remove active from all buttons
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('active');
                b.style.backgroundColor = '';
                b.style.color = '';
                b.style.borderColor = '';
            });
            
            // Force add active to clicked button
            tabBtn.classList.add('active');
            tabBtn.style.backgroundColor = '#2d5016';
            tabBtn.style.color = 'white';
            tabBtn.style.borderColor = '#2d5016';
            console.log('Button should now be green');
            
            // Get period and update content
            const period = tabBtn.getAttribute('data-period');
            console.log('Current period set to:', period);
            
            // Update title based on period
            const titleElement = document.getElementById('collections-title');
            const titles = {
                'today': "Today's Collections",
                'week': "This Week's Collections",
                'month': "This Month's Collections"
            };
            if (titleElement) {
                titleElement.textContent = titles[period] || "Collections";
                console.log('Title updated to:', titles[period]);
            }
            
            // Load data for selected period
            loadHistory(period);
        }
    });

    // Load home content on initial page load
    if (mainContent.innerHTML.trim() === '') {
        loadContent(contentRoutes['home']);
    }
});
