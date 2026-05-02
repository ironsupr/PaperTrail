@echo off
cd /d D:\Project\PaperTrail\backend
set PYTHONPATH=D:\Project\PaperTrail\backend
uvicorn main:app --host 127.0.0.1 --port 8000
