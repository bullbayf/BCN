@echo off
copy /Y "c:\Users\MOISES\OneDrive\Documentos\Stich IA\flamenco.webp" "c:\Users\MOISES\OneDrive\Documentos\Stich IA\stitch_bienvenida_y_transporte_t1\stitch_bienvenida_y_transporte_t1\flamenco.webp"
if exist "flamenco.webp" (
    echo SUCCESS
) else (
    echo FAILED
)
