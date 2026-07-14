@echo off
chcp 65001 >nul
:: Меняем кодировку на UTF-8, чтобы русские буквы в консоли отображались нормально

set MSG=%~1
if "%MSG%"=="" set MSG=Auto-commit: %date% %time%

echo Индексация файлов...
git add .

echo Создание коммита: %MSG%
git commit -m "%MSG%"

echo Отправка в удаленный репозиторий...
git push

echo ✅ Синхронизация завершена.
pause