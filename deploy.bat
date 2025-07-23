@echo off
REM ============================================
REM Script de déploiement Piscord
REM Auteur: William
REM ============================================

echo ========================================
echo    DEPLOIEMENT PISCORD
echo ========================================

REM Configuration
set ENVIRONMENT=production
set LOG_FILE=deployment_%date:~6,4%%date:~3,2%%date:~0,2%.log

if not exist "logs" mkdir logs
echo [%date% %time%] Début déploiement >> logs\%LOG_FILE%

echo 1. Vérification des prérequis...

REM Vérification Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Docker n'est pas installé
    goto :error_exit
)

REM Vérification fichier de configuration
if not exist "docker-compose.yml" (
    echo ERREUR: docker-compose.yml introuvable
    goto :error_exit
)

echo    ✓ Prérequis validés

echo 2. Arrêt des services existants...
docker-compose down --remove-orphans 2>>logs\%LOG_FILE%
echo    ✓ Services arrêtés

echo 3. Construction et démarrage...
docker-compose build --no-cache 2>>logs\%LOG_FILE%
if errorlevel 1 (
    echo ERREUR: Échec du build
    goto :error_exit
)

docker-compose up -d 2>>logs\%LOG_FILE%
if errorlevel 1 (
    echo ERREUR: Échec du démarrage
    goto :error_exit
)

echo    ✓ Services démarrés

echo 4. Vérification de l'état...
timeout /t 10 /nobreak >nul
docker-compose ps

REM Vérification que les services sont UP
docker-compose ps | findstr "Up" >nul
if errorlevel 1 (
    echo AVERTISSEMENT: Certains services peuvent ne pas être démarrés
)

echo 5. Tests de base...
ping -n 1 127.0.0.1 >nul
if errorlevel 1 (
    echo ERREUR: Problème de connectivité
    goto :error_exit
)
echo    ✓ Connectivité OK

echo ========================================
echo     DEPLOIEMENT REUSSI !
echo ========================================
echo.
echo Application accessible sur: https://localhost
echo.
echo Commandes utiles:
echo   docker-compose logs -f    (voir les logs)
echo   docker-compose down       (arrêter)
echo   docker-compose restart    (redémarrer)

echo [%date% %time%] Déploiement réussi >> logs\%LOG_FILE%
echo %date% %time% - Déploiement réussi >> deployment_history.log

goto :end

:error_exit
echo ========================================
echo     ECHEC DU DEPLOIEMENT !
echo ========================================
echo Consultez les logs: logs\%LOG_FILE%
echo [%date% %time%] ECHEC déploiement >> logs\%LOG_FILE%
exit /b 1

:end
pause
exit /b 0