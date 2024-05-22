# Development Set-up
## Prerequisites
### Setting up the Django back-end

#### Installing Python (Windows)
- Download Python through their website: https://www.python.org/downloads/
- After installation, verify installation by checking the current version
```
py --version
```

#### Set up virtual environment and install dependencies (Windows)
```
python -m venv
virtualenv env
.\env\Scripts\activate
pip install -r requirements.txt
```
Exit the virtual environment using ```deactivate```

#### Installing Django in the virtual environment (Windows)
```
py -m pip install Django
```

#### Create admin user in Django
```
python manage.py createsuperuser
```

#### Manage changes to the database
This is needed after cloning the repository.
- Run ```python manage.py makemigrations app``` to create migrations for those changes
- Run ```python manage.py migrate``` to apply those changes to the database

### Setting up the NextJS front-end

Install NextJS
```
npm install next@latest react@latest react-dom@latest
```

Install other dependencies in the project
```
cd frontend
npm install
```

## Instructions

### Running the Django back-end
```
cd backend
.\env\Scripts\activate
python manage.py runserver
```

### Running the NextJS front-end
```
cd frontend
npm run dev
```

