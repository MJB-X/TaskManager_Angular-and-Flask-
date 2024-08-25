import os
from flask import Flask, request, jsonify, render_template, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token
from flask_cors import CORS
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError

# Initialize Flask app
app = Flask(__name__)
CORS(app)
# Base directory for the project
basedir = os.path.abspath(os.path.dirname(__file__))

# Ensure the 'instance' directory exists
instance_path = os.path.join(basedir, 'instance')
if not os.path.exists(instance_path):
    os.makedirs(instance_path)

# Configure the app
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(instance_path, "app2.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
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
    id = db.Column(db.Integer, primary_key=True,autoincrement=True)
    title = db.Column(db.String(100), nullable=False)
    desc = db.Column(db.String(200))
    status = db.Column(db.String(50), default='Pending')
    priority = db.Column(db.String(50))
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)

    subtasks = db.relationship('Subtask', backref='task', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Task {self.title}>'


class Subtask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    done = db.Column(db.Boolean, default=False)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)

    def __repr__(self):
        return f'<Subtask {self.name}>'


# Create the database tables
# with app.app_context():
#     db.create_all()

# Routes
@app.route('/')
def index():
    users = User.query.all()
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
def delete_user(uid):
    user = User.query.get(uid)
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
def get_tasks():
    tasks = Task.query.all()
    return jsonify([{
        'id': task.id,
        'title': task.title,
        'desc': task.desc,
        'status': task.status,
        'priority': task.priority,
        'startDate': task.start_date.strftime('%Y-%m-%dT%H:%M:%S') if task.start_date else None,
        'endDate': task.end_date.strftime('%Y-%m-%dT%H:%M:%S') if task.end_date else None,
        'subtasks': [{'id': subtask.id, 'name': subtask.name, 'done': subtask.done} for subtask in task.subtasks]
    } for task in tasks])


# Get a specific task by ID
@app.route('/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    task = Task.query.get_or_404(task_id)
    task_data = {
        'id': task.id,
        'title': task.title,
        'desc': task.desc,
        'status': task.status,
        'priority': task.priority,
        'startDate': task.start_date.strftime('%Y-%m-%dT%H:%M:%S') if task.start_date else None,
        'endDate': task.end_date.strftime('%Y-%m-%dT%H:%M:%S') if task.end_date else None,
        'subtasks': [{'id': subtask.id, 'name': subtask.name, 'done': subtask.done} for subtask in task.subtasks]
    }
    return jsonify(task_data)


# Create a new task
@app.route('/tasks', methods=['POST'])
def create_task():
    try:
        data = request.get_json()
        
        # Validate required fields
        if 'title' not in data:
            return jsonify(error="Title is required"), 400

        # Parse and validate dates
        start_date = parse_date(data.get('startDate'))
        end_date = parse_date(data.get('endDate'))

        # Create task
        task = Task(
            title=data['title'],
            desc=data.get('desc', ''),
            status=data.get('status', 'Pending'),
            priority=data.get('priority', 'Normal'),
            start_date=start_date,
            end_date=end_date
        )
        db.session.add(task)
        db.session.flush()  # This assigns an ID to the task without committing

        # Create subtasks
        subtasks = data.get('subtasks', [])
        for sub in subtasks:
            subtask = Subtask(
                name=sub.get('name', ''),
                done=sub.get('done', False),
                task_id=task.id
            )
            db.session.add(subtask)

        db.session.commit()

        # Prepare response
        response_data = task_to_dict(task)
        return jsonify(response_data), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify(error=str(e)), 500
    except Exception as e:
        return jsonify(error=str(e)), 400

def parse_date(date_string):
    if date_string:
        try:
            # Try parsing ISO 8601 format with milliseconds and UTC 'Z'
            return datetime.strptime(date_string, '%Y-%m-%dT%H:%M:%S.%fZ')
        except ValueError:
            try:
                # Fallback to ISO 8601 format without milliseconds
                return datetime.strptime(date_string, '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                try:
                    # Fallback to simple date format
                    return datetime.strptime(date_string, '%Y-%m-%d')
                except ValueError:
                    raise ValueError(f"Invalid date format: {date_string}")
    return None



def task_to_dict(task):
    return {
        'id': task.id,
        'title': task.title,
        'desc': task.desc,
        'status': task.status,
        'priority': task.priority,
        'startDate': task.start_date.isoformat() if task.start_date else None,
        'endDate': task.end_date.isoformat() if task.end_date else None,
        'subtasks': [{'id': st.id, 'name': st.name, 'done': st.done} for st in task.subtasks],
        'completed': task.status == 'Completed'
    }


# Update a task
@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    try:
        task = Task.query.get_or_404(task_id)
        data = request.get_json()

        if not data:
            return jsonify(error="No data provided"), 400

        # Update main task fields
        for field in ['title', 'desc', 'status', 'priority']:
            if field in data:
                setattr(task, field, data[field])

        # Handle dates
        start_date = parse_date(data.get('startDate'))
        end_date = parse_date(data.get('endDate'))
        if start_date:
            task.start_date = start_date
        if end_date:
            task.end_date = end_date

        # Handle subtasks
        if 'subtasks' in data:
            current_subtasks = {subtask.id: subtask for subtask in task.subtasks}

            for subtask_data in data['subtasks']:
                subtask_id = subtask_data.get('id')
                if subtask_id:
                    # Update existing subtask
                    subtask = current_subtasks.pop(subtask_id, None)
                    if subtask:
                        subtask.name = subtask_data.get('name', subtask.name)
                        subtask.done = subtask_data.get('done', subtask.done)
                else:
                    # Add new subtask
                    new_subtask = Subtask(
                        name=subtask_data['name'],
                        done=subtask_data.get('done', False),
                        task_id=task.id
                    )
                    db.session.add(new_subtask)

            # Delete removed subtasks
            for subtask in current_subtasks.values():
                db.session.delete(subtask)

        db.session.commit()

        # Serialize the updated task
        updated_task = task_to_dict(task)
        return jsonify(updated_task), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify(error=f"Database error: {str(e)}"), 500
    except ValueError as e:
        return jsonify(error=str(e)), 400
    except Exception as e:
        return jsonify(error=f"An error occurred: {str(e)}"), 500



# Delete a task
@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify(message="Task deleted successfully")


# Get all subtasks
@app.route('/subtasks', methods=['GET'])
def get_all_subtasks():
    subtasks = Subtask.query.all()
    return jsonify([{
        'id': subtask.id,
        'name': subtask.name,
        'done': subtask.done,
        'task_id': subtask.task_id
    } for subtask in subtasks])


# Get subtasks for a task
@app.route('/tasks/<int:task_id>/subtasks', methods=['GET'])
def get_subtasks(task_id):
    task = Task.query.get_or_404(task_id)
    subtasks = Subtask.query.filter_by(task_id=task.id).all()
    return jsonify([{
        'id': subtask.id,
        'name': subtask.name,
        'done': subtask.done
    } for subtask in subtasks])


# Add a subtask to a task
@app.route('/tasks/<int:task_id>/subtasks', methods=['POST'])
def add_subtask(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.get_json()
    name = data['name']
    done = data.get('done', False)
    subtask = Subtask(name=name, done=done, task_id=task.id)
    db.session.add(subtask)
    db.session.commit()
    return jsonify(message="Subtask created successfully"), 201


# Update a subtask
@app.route('/subtasks/<int:subtask_id>', methods=['PUT'])
def update_subtask(subtask_id):
    subtask = Subtask.query.get_or_404(subtask_id)
    data = request.get_json()
    subtask.name = data.get('name', subtask.name)
    subtask.done = data.get('done', subtask.done)
    db.session.commit()
    return jsonify(message="Subtask updated successfully")


# Delete a subtask
@app.route('/subtasks/<int:subtask_id>', methods=['DELETE'])
def delete_subtask(subtask_id):
    subtask = Subtask.query.get_or_404(subtask_id)
    db.session.delete(subtask)
    db.session.commit()
    return jsonify(message="Subtask deleted successfully")


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
