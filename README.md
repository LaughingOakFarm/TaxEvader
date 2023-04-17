# sudo crontab -e
@reboot nohup ts-node /home/pi/Desktop/TaxEvader/controller/server.ts &
@reboot nohup serve -s /home/pi/Desktop/TaxEvader/ui/build & 

# sudo nano /etc/xdg/autostart/myapp.desktop
[Desktop Entry]
Exec=chromium-browser --start-fullscreen

