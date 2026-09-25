FULL-SCREEN GAMEPLAY TRIAL

Apply on top of the previous landscape/joystick version. Replace game.css and the included files in js/. Keep your index.html, images, audio and Home Screen meta tags.

The playable world now fills the available browser window. There is no fixed aspect-ratio boundary. The UFO and projectiles use the entire screen, while all artwork is scaled uniformly. The moon remains anchored on the right and the touch joystick stays bottom-left. Landscape prompting is retained.

screen.js now uses 1920x1080 as a size reference only, not a fixed playfield ratio. Screen aspect ratios determine how much space is available. Existing objects keep their relative position on resize. The old projectile-overflow.js is no longer used; leaving it in your folder is harmless.

This fills the webpage viewport; it does not force iPhone Safari browser bars to disappear. Launch from the Home Screen for your existing standalone experience.

Checked full-viewport rendering and gameplay at 956x440 and 1024x768, joystick visibility, JavaScript syntax, and automated screen coverage/player-boundary/input mapping tests at six viewport sizes. No physical device testing was performed.

The earlier ZIPs remain available if you prefer the previous layout.
