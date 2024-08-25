import os
from flask import Flask, request, jsonify, abort, render_template, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from datetime import datetime


# Initialize Flask app
app = Flask(__name__)

# Base directory for the project
basedir = os.path.abspath(os.path.dirname(__file__))

# Ensure the 'instance' directory exists
instance_path = os.path.join(basedir, 'instance')
if not os.path.exists(instance_path):
    os.makedirs(instance_path)

# Configure the app
# Configuration for SQLAlchemy -
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(instance_path, "app.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# db = SQLAlchemy(app)

# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-jwt-secret-key')

db = SQLAlchemy(app)
CORS(app)
jwt = JWTManager(app)


# Define models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200))
    status = db.Column(db.String(50), default='Pending')  # Status: 'Completed', 'Pending', 'Inprogress', etc.
    due_date = db.Column(db.DateTime, nullable=True)  # Due date field

# # Create the database tables
# with app.app_context():
#     db.create_all()


# Routes
@app.route('/')
def index():
    users = User.query.all()
    # print("hii", users)
    return render_template('index.html', users=users)


# Add User Route For Flask App
@app.route('/user', methods=['POST'])
def add_user():
    username = request.form['username']
    password = request.form['password']
    new_user = User(username=username, password=password)
    db.session.add(new_user)
    db.session.commit()
    return redirect(url_for('index'))


# Delete User Route For Flask App
@app.route('/user/<int:id>')
def delete_user(id):
    user = User.query.get(id)
    db.session.delete(user)
    db.session.commit()
    return redirect(url_for('index'))


# User registration route for API for Angular App
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    password = data['password']
    new_user = User(username=username, password=password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify(message="User created successfully"), 201


# User login route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if user and user.password == data['password']:
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token)
    return jsonify(message="Invalid credentials"), 401


# Get all tasks
@app.route('/tasks', methods=['GET'])
# @jwt_required()
def get_tasks():
    tasks = Task.query.all()
    return jsonify([{
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'status': task.status,
        'due_date': task.due_date.strftime('%Y-%m-%d') if task.due_date else None
    } for task in tasks])


# Get a specific task by ID
@app.route('/tasks/<int:task_id>', methods=['GET'])
# @jwt_required()
def get_task(task_id):
    task = Task.query.get_or_404(task_id)
    task_data = {
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'status': task.status,
        'due_date': task.due_date.strftime('%Y-%m-%d') if task.due_date else None
    }
    return jsonify(task_data)


# Create a new task
@app.route('/tasks', methods=['POST'])
# @jwt_required()
def create_task():
    data = request.get_json()
    title = data['title']
    description = data.get('description')
    status = data.get('status', 'Pending')
    due_date = data.get('due_date')  # Expecting due date from the request body

    if due_date:
        due_date = datetime.strptime(due_date, '%Y-%m-%d')  # Convert string to datetime

    task = Task(title=title, description=description, status=status, due_date=due_date)
    db.session.add(task)
    db.session.commit()
    return jsonify(message="Task created successfully"), 201


# Update a task
@app.route('/tasks/<int:task_id>', methods=['PUT'])
# @jwt_required()
def update_task(task_id):
    data = request.get_json()
    task = Task.query.get_or_404(task_id)

    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.status = data.get('status', task.status)

    due_date = data.get('due_date')
    if due_date:
        task.due_date = datetime.strptime(due_date, '%Y-%m-%d')  # Update due date if provided

    db.session.commit()
    return jsonify(message="Task updated successfully")


# Delete a task
@app.route('/tasks/<int:task_id>', methods=['DELETE'])
# @jwt_required()
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify(message="Task deleted successfully")


if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Create the database and tables
    app.run(debug=True)
    