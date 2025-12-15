document.addEventListener('DOMContentLoaded', function() {
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

    const contentRoutes = {
        'overview': '/overview/',
        'tank_status': '/tank_status/',
        'vehicles': '/vehicles/',
        'analytics': '/analytics/',
        'settings': '/settings/'
    };

    // --- 2. Content Loading Logic ---
    window.loadContent = function(url) {
        // Highlight the correct Sidebar Item
        let activeKey = null;
        for (const [key, route] of Object.entries(contentRoutes)) {
            if (url.includes(key) || url.includes(key.replace('_', ''))) {
                activeKey = key;
                break;
            }
        }
        if (activeKey) {
            Object.values(menuItems).forEach(el => { if(el) el.classList.remove('active'); });
            if(menuItems[activeKey]) menuItems[activeKey].classList.add('active');
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
                
                // CRITICAL: Re-execute scripts inside the new HTML (needed for filters)
                mainContent.querySelectorAll('script').forEach(oldScript => {
                    const newScript = document.createElement('script');
                    Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                    newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                });

                // CRITICAL: Fetch the Data for the page that just loaded
                if (url.includes('overview')) initOverview();
                if (url.includes('tank_status')) initTankStatus();
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
        mainContent.addEventListener('click', function(event) {
            const link = event.target.closest('a, button');
            if (!link) return;

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

        // --- 5. Form Submission (Create/Edit Vehicles) ---
        mainContent.addEventListener('submit', function(event) {
            const form = event.target;
            
            // Only intercept specific forms
            if (form.id === 'vehicle-create-form') {
                event.preventDefault();
                const formData = new FormData(form);
                const submitBtn = form.querySelector('button[type="submit"]');
                
                if(submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = 'Saving...'; }

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
                        if(data.html) mainContent.innerHTML = data.html;
                        else alert('Error saving vehicle');
                    }
                })
                .catch(err => {
                    console.error(err);
                    // Reload list if it was actually a success but parsed wrong, otherwise alert
                    alert('An error occurred or the response was not JSON.');
                    if(submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'Save'; }
                });
            }
        });
    }

    // --- 6. Global Functions (Helpers) ---
    window.loadVehicleList = function() { loadContent('/vehicles/'); };
    window.loadCreateBinForm = function() { loadContent('/bins/create/'); };
    
    // Filters (Must be global)
    window.filterTanks = function() {
        const input = document.getElementById('tankSearch');
        if (!input) return;
        const filter = input.value.toLowerCase();
        document.querySelectorAll('.tank-card').forEach(card => {
            card.style.display = card.textContent.toLowerCase().includes(filter) ? "" : "none";
        });
    };

    window.filterStatus = function(selectedStatus) {
        document.querySelectorAll('.tank-card').forEach(card => {
            const cardStatus = card.getAttribute('data-status');
            if (selectedStatus === 'all' || cardStatus === selectedStatus) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
        });
    };

    // --- 7. Data Initializers ---
    
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
                if(container && data.recent_alerts) {
                    if(data.recent_alerts.length === 0) {
                        container.innerHTML = '<p style="color:#888;">No recent alerts.</p>';
                    } else {
                        container.innerHTML = data.recent_alerts.map(a => 
                            `<div class="alert-item" style="padding:10px; border-bottom:1px solid #eee;">
                                <strong>${a.bin_id || 'Bin'}</strong>: ${a.alert_type.replace('_',' ')}
                                <span style="float:right; color:#888; font-size:0.8em;">${new Date(a.timestamp).toLocaleTimeString()}</span>
                             </div>`
                        ).join('');
                    }
                }
            })
            .catch(e => console.error("Overview API Error:", e));
    }

    function initTankStatus() {
        console.log("Initializing Tanks...");
        const grid = document.getElementById('tankGrid');
        if (!grid) return;
        
        grid.innerHTML = '<p style="text-align:center; width:100%; color:#888;">Loading tanks...</p>';

        fetch('/api/tanks/')
            .then(res => res.json())
            .then(data => {
                grid.innerHTML = '';
                if (!data || data.length === 0) {
                    grid.innerHTML = '<div class="no-data"><p>No waste bins found.</p></div>';
                    return;
                }
                data.forEach(bin => {
                    const fillLevel = bin.fill_level ? Number(bin.fill_level) : 0;
                    
                    // Status Logic
                    let displayStatus = bin.status ? bin.status.toLowerCase() : 'unknown';
                    let badgeClass = 'status-active';
                    if (displayStatus !== 'maintenance') {
                        if (fillLevel >= 90) { displayStatus = 'full'; badgeClass = 'status-inactive'; }
                        else if (fillLevel >= 50) { displayStatus = 'intermediate'; badgeClass = 'status-maintenance'; }
                        else { displayStatus = 'empty'; badgeClass = 'status-active'; }
                    } else { badgeClass = 'status-maintenance'; }

                    // Location Logic
                    const loc = bin.location_details || bin.location || {};
                    let sector = loc.sector || loc.district || 'Unassigned';
                    let house = loc.house ? `House: ${loc.house}` : '';

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
                            <a href="#" class="details-link">Details <i class="fas fa-arrow-right"></i></a>
                        </div>
                    `;
                    grid.appendChild(card);
                });
            })
            .catch(e => console.error("Tank API Error:", e));
    }

    function safeSetText(id, val) { const el=document.getElementById(id); if(el) el.innerText = val || 0; }

    // Initial Load
    if (mainContent.innerHTML.trim() === '') loadContent(contentRoutes['overview']);
});