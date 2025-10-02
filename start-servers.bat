@echo off
echo Starting WinterSolace servers...

echo.
echo Starting main website server...
start "Main Server" cmd /k "node main-server.js"

echo.
echo Starting Track123 tracking server...
start "Track123 Server" cmd /k "node track123-server.js"

echo.
echo Starting payment server...
start "Payment Server" cmd /k "node payment-server.js"

echo.
echo Starting email notification server...
start "Email Server" cmd /k "node email-notification-server.js"

echo.
echo Starting order confirmation server...
start "Order Confirmation Server" cmd /k "node order-confirmation-server.js"

echo.
echo All servers are starting...
echo Main website: http://localhost:3000
echo Tracking server: http://localhost:3001
echo Payment server: http://localhost:3002
echo Email notifications: http://localhost:3003
echo Order confirmations: http://localhost:3004
echo.
echo Press any key to exit...
pause

