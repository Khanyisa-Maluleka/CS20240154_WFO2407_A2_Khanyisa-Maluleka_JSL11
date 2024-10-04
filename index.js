// TASK: import helper functions from utils
import { createNewTask, putTask, deleteTask } from "./utils/taskFunctions.js";

// TASK: import initialData
import { initialData } from "./initialData.js";

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }

  
}

// TASK: Get elements from the DOM
const elements = {
  switchTheme: document.getElementById('switch'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  headerBoardName: document.getElementById('header-board-name'),
  addNewTaskBtn: document.getElementById('add-new-task-btn'),//createNewTaskBtn
  columnDivs: document.querySelectorAll('.column-div'),
  modalWindow: document.getElementById('new-task-modal-window'),
  editTaskModal: document.getElementById('edit-task-modal-window'), 
  filterDiv: document.getElementById('filterDiv')
}

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; 
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = JSON.parse(localStorage.getItem('tasks')) || []; // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    tasksContainer.classList.add("tasks-container");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click', () => { 
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') 
    }
    else {
      btn.classList.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title || 'Untitled Task';// Modify as needed
  taskElement.setAttribute('data-task-id', task.id || 'No ID');
  
  tasksContainer.appendChild(taskElement); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  // Theme switch event listener
  elements.switchTheme.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.addNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  if(modal) {
  modal.style.display = show ? 'block' : 'none'; 
  }
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  const titleInput = document.getElementById('title-input');
  const descInput = document.getElementById('desc-input');
  const statusSelect = document.getElementById('select-status');

  //Assign user input to the task object
    const task = {
      id: Date.now(),
      title: titleInput.value,
      description: descInput.value,
      status: statusSelect.value,
      board: activeBoard
    };
    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}


function toggleSidebar(show) {
  const sidebar = document.getElementById('side-bar-div');
  const layout = document.getElementById('layout');
  const showSidebarBtn = document.getElementById('show-side-bar-btn');

  sidebar.style.display = show ? 'flex' : 'none'; 
  layout.style.marginLeft = show ? '300px' : '0';
  layout.style.paddingRight = show ? '300px' : '0';
  showSidebarBtn.style.display = show ? 'none' : 'block';

  localStorage.setItem('showSideBar', show.toString());
}

function toggleTheme() {
  document.body.classList.toggle('light-theme');
  const isLightTheme = document.body.classList.contains('light-theme');
  localStorage.setItem('light-theme', isLightTheme ? 'enabled' : 'disabled');
  
  // Update logo
  const logo = document.getElementById('logo');
  logo.src = isLightTheme ? './assets/logo-light.svg' : './assets/logo-dark.svg';
}



function openEditTaskModal(task) {
  // Set task details in modal inputs
  const titleInput = document.getElementById('edit-task-title-input');
  const descInput = document.getElementById('edit-task-desc-input');
  const statusSelect = document.getElementById('edit-select-status');

  // Get button elements from the task modal

  titleInput.value = task.title;
  descInput.value = task.description;
  statusSelect.value = task.status;
  // Call saveTaskChanges upon click of Save Changes button
 
  const saveChangesBtn = document.getElementById('save-task-changes-btn');
  const deleteTaskBtn = document.getElementById('delete-task-btn');
  // Delete task using a helper function and close the task modal

  if (saveChangesBtn) {
  saveChangesBtn.onclick = () => saveTaskChanges(task.id);
  refreshTasksUI();
  }

  if(deleteTaskBtn) {
  deleteTaskBtn.onclick = () => deleteTaskAndUpdateUI(task.id);
  refreshTasksUI()
  }
  
  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const titleInput = document.getElementById('edit-task-title-input');
  const descInput = document.getElementById('edit-task-desc-input');
  const statusSelect = document.getElementById('edit-select-status');

  // Create an object with the updated task details
  const updatedTask = {
    id: taskId,
    title: titleInput.value,
    description: descInput.value,
    status: statusSelect.value,
    board: activeBoard
  };

  // Update task using a hlper functoin
  putTask(taskId, updatedTask);
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}
  // Close the modal and refresh the UI to reflect the changes
  function deleteTaskAndUpdateUI(taskId) {
    deleteTask(taskId);
    toggleModal(false, elements.editTaskModal);
    refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData()
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}