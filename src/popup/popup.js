// TO DO: Every edit is saved as a string - this causes errors.
//        Empty modules cause errors in contentGenerator.js.
//        Translations.
//        Improvement? Change Modultyp to letters K, E, P, M (Major/Minor)

const studyMajorOptionsByStudiengang = {
    ICS: ['Attack Specialist & Penetration Tester (MSP)', 'Digital Forensics & Incident Response (MSF)', 'Security of Cloud, Mobile & IoT (MSC)', 'Security Management (MSM)', 'Security Technology (MST)'],
    I: ['Artificial Intelligence & Visual Computing', 'Augmented & Virtual Reality', 'Data Engineering & Data Science', 'Software Engineering & DevOps', 'Human Computer Interaction Design', 'IT Operation & Security', 'Software Development'],
    AIML: ['Information + Cyber Security Minor', 'Software Engineering Minor', 'Medtech + Healthcare Minor', 'Cognitive Robotics Minor'],
    WI: ['Augmented & Virtual Reality', 'Business Analysis', 'Digital Business', 'Data Engineering & Data Science', 'Human Computer Interaction Design', 'IT Operation & Security', 'Informatik PLUS'],
    DI: ['']
};
const myStudiesProperties = ["studyProgram", "studySchedule", "startSemester", "studyMajor"];
const moduleProperties = ["moduleName", "semester", "note", "grade", "ects", "moduleType", "durchfuehrung"];
const savingDelay = 1000;

// Helper function to perform storage operation (get or set)
async function _storageOperation(action, obj, itemID) {
    // Create a storage object with the specified itemID and serialized JSON data
    const storageObject = {};
    storageObject[itemID] = JSON.stringify(obj);

    // Determine the storage API based on the browser environment
    const storage = typeof browser !== 'undefined' ? browser.storage.sync : chrome.storage.sync;

    try {
        // Perform the storage operation (set or get) using a Promise
        await new Promise((resolve, reject) => {
            storage[action](storageObject, () => {
                // Check for any runtime errors and handle them
                const lastError = chrome.runtime.lastError || (typeof browser !== 'undefined' && browser.runtime.lastError);
                if (lastError) {
                    reject(new Error(lastError));
                } else {
                    resolve();
                }
            });
        });

        // If the operation is 'get', retrieve the stored data and parse it
        if (action === 'get') {
            const result = await new Promise((resolve, reject) => {
                storage.get(itemID, (result) => {
                    // Check for any runtime errors and handle them
                    const lastError = chrome.runtime.lastError || (typeof browser !== 'undefined' && browser.runtime.lastError);
                    if (lastError) {
                        reject(new Error(lastError));
                    } else {
                        resolve(result);
                    }
                });
            });

            // Parse the stored JSON data or return an empty object if data is missing
            const storedJsonString = result[itemID];
            return JSON.parse(storedJsonString || '{}');
        }
    } catch (error) {
        // Throw any encountered errors for further handling
        throw error;
    }
}

// Function to save object to storage.sync
async function _save_to_localstorage(obj, itemID) {
    await _storageOperation('set', obj, itemID);
}

// Function to get object from storage.sync
async function _get_from_localstorage(itemID) {
    return _storageOperation('get', null, itemID);
}

async function getStudentData() {
    try {
        const studentData = await _get_from_localstorage('student');
        console.log("Student Data:", studentData);
        return studentData || {};
    } catch (error) {
        console.error("Error retrieving student data:", error);
        return {};
    }
}

async function saveStudentData(student_data) {
    try {
        await _save_to_localstorage(student_data, 'student');
        console.log("Successfully saved Student to storage.sync");
        const savedData = await _get_from_localstorage('student');
        console.log("Saved Data:", savedData);
        start();
    } catch (error) {
        console.error("Error updating student data:", error);
    }
}

function displayMyStudies(student_data) {
    for (const property of myStudiesProperties) {
        const dropdown = document.getElementById(property);

        if (dropdown) {
            dropdown.onload = () => {
                dropdown.value = student_data[property] || '';

                if (property === 'studyMajor') {
                    // Populate study major dropdown based on selected study program
                    populateStudyMajorDropdown(dropdown, student_data.studyProgram);
                }
            };
        } else {
            console.error(`Dropdown not found for property: ${property}`);
        }
    }
}

function populateSemesterDropdown(selectElement) {
    // Clear existing options
    selectElement.innerHTML = '';

    const currentYear = new Date().getFullYear();
    const startYear = currentYear + 1; // Start from the next year
    const yearsToDisplay = 8;

    for (let i = 0; i <= yearsToDisplay; i++) {
        const year = startYear - i;
        for (let semester of ['H', 'F']) {
            const optionValue = semester + (year % 100);
            const optionText = semester + (year % 100);

            const option = document.createElement('option');
            option.value = optionValue;
            option.text = optionText;

            selectElement.add(option);
        }
    }
}

function populateStudyMajorDropdown(selectElement, studiengang) {
    // Clear existing options
    selectElement.innerHTML = '';

    // Get available study major options based on the selected Studiengang
    const availableStudyMajorOptions = getAvailableStudyMajorOptions(studiengang);

    // Populate dropdown with available options
    availableStudyMajorOptions.forEach((option) => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.text = option;

        selectElement.add(optionElement);
    });
}

function getAvailableStudyMajorOptions(studiengang) {
    return studyMajorOptionsByStudiengang[studiengang] || [];
}

function addDropdownChangeListeners(selector, handleChangeFunction, student_data) {
    // Remove existing event listeners
    removeDropdownChangeListeners();

    // Add new event listeners for the specified dropdowns
    document.querySelectorAll(selector).forEach((dropdown) => {
        dropdown.addEventListener("change", function (event) {
            handleChangeFunction(event.target, student_data);
        });
    });
}

async function handleDropdownChange(dropdown, student_data) {
    try {
        // Log the change event and selected value
        console.log("Dropdown change event triggered:", dropdown.value);

        // Extract the dataset property
        const property = dropdown.dataset.property;

        // Update the property directly in student_data
        student_data[property] = dropdown.value;

        // Save the updated student data
        await saveStudentData(student_data);

        // Log for debugging purposes
        console.log("Student data saved:", student_data);
    } catch (error) {
        console.error("Error handling dropdown change:", error);
    }
}

function removeDropdownChangeListeners() {
    document.querySelectorAll('select[data-property]').forEach((dropdown) => {
        dropdown.removeEventListener("change", handleDropdownChange);
    });
}

function displayModulesInTable(student_data) {
    const modules = Array.isArray(student_data.modulesVisited) ? student_data.modulesVisited : [];
    let tableBody = document.querySelector("#module-table tbody");

    // Clear existing rows
    tableBody.innerHTML = "";

    // Display modules
    modules.forEach((module) => {
        let row = tableBody.insertRow();

        // Iterate over predefined module properties and create cells
        moduleProperties.forEach((property) => {
            let cell = row.insertCell();
            cell.textContent = Array.isArray(module[property]) ? module[property].join(', ') : module[property] || '';
            cell.contentEditable = true;
            cell.dataset.property = property;
        });
    });

    // Check if there are no modules or the last row is already empty
    if (modules.length === 0 || (modules.length > 0 && !isLastRowEmpty(tableBody))) {
        let emptyRow = tableBody.insertRow();
        moduleProperties.forEach((property) => {
            let cell = emptyRow.insertCell();
            cell.textContent = '';
            cell.contentEditable = true;
            cell.dataset.property = property;
        });

        // Add the empty row to the modulesVisited array
        student_data.modulesVisited.push({});
    }
}

function isLastRowEmpty(tableBody) {
    if (tableBody.rows.length === 0) {
        return true;
    }

    const lastRow = tableBody.rows[tableBody.rows.length - 1];
    return Array.from(lastRow.cells).every((cell) => cell.textContent.trim() === '');
}

function populateModuleDropdown(selectElement, modulesVisited) {
    // Clear existing options
    selectElement.innerHTML = '';

    // Filter modules with a valid name
    const validModules = modulesVisited.filter(module => module.moduleName);

    // Populate dropdown with valid module names
    validModules.forEach((module, index) => {
        const optionElement = document.createElement('option');
        optionElement.value = index;
        optionElement.text = module.moduleName;
        selectElement.add(optionElement);
    });
}

async function removeModule(selectElement) {
    try {
        const selectedIndex = parseInt(selectElement.value, 10);
        const student_data = await getStudentData();

        if (student_data.modulesVisited && !isNaN(selectedIndex) && selectedIndex >= 0 && selectedIndex < student_data.modulesVisited.length) {
            // Remove the selected module from the array
            student_data.modulesVisited.splice(selectedIndex, 1);

            // Save the updated student data
            await saveStudentData(student_data);

            // Reload the extension popup
            window.location.reload();
        } else {
            console.error("Invalid module index or modulesVisited array is undefined/empty.", student_data.modulesVisited);
        }
    } catch (error) {
        console.error("Error removing module:", error);
    }
}

function setupRemoveModuleButton() {
    const removeModuleBtn = document.getElementById('removeModuleBtn');

    removeModuleBtn.addEventListener('click', function () {
        const moduleToRemoveDropdown = document.getElementById('moduleToRemove');
        removeModule(moduleToRemoveDropdown);
    });
}

async function handleCellInput(cell, student_data) {
    try {
        // Log the input event and cell content
        console.log("Input event triggered:", cell.textContent);

        // Extract the dataset properties
        const property = cell.dataset.property;
        const rowIndex = cell.parentElement.rowIndex - 1; // Adjust for the header row

        // Check if the property is in the modulesVisited array
        if (student_data.modulesVisited[rowIndex] && student_data.modulesVisited[rowIndex].hasOwnProperty(property)) {
            // Update the property inside the modulesVisited array
            student_data.modulesVisited[rowIndex][property] = cell.textContent.trim();
        } else {
            // Update other properties directly in student_data
            student_data[property] = cell.textContent.trim();
        }

        // Save the updated student data
        await saveStudentData(student_data);

        // Log for debugging purposes
        console.log("Student data saved:", student_data);
    } catch (error) {
        console.error("Error handling cell input:", error);
    }
}

let debounceTimer;

function addInlineEditListeners(selector, handleCellInputFunction, student_data) {
    // Remove existing event listeners
    removeInlineEditListeners();

    // Add new event listeners for the specified section
    document.querySelectorAll(selector).forEach((cell) => {
        cell.addEventListener("input", function (event) {
            console.log("Input event triggered:", event.target.textContent);

            // Clear the previous debounce timer
            clearTimeout(debounceTimer);

            // Set a new debounce timer
            debounceTimer = setTimeout(() => {
                handleCellInputFunction(event.target, student_data);
            }, savingDelay);
        });
    });
}

async function handleCellInputModules(cell, student_data) {
    try {
        // Log the input event and cell content
        console.log("Modules Input event triggered:", cell.textContent);

        // Extract the dataset properties
        const property = cell.dataset.property;
        const rowIndex = cell.parentElement.rowIndex - 1; // Adjust for the header row

        // Ensure modulesVisited array exists
        if (!student_data.modulesVisited) {
            student_data.modulesVisited = [];
        }

        // Check if the property is in the modulesVisited array
        if (rowIndex >= 0 && rowIndex < student_data.modulesVisited.length) {
            // Update the property inside the modulesVisited array
            student_data.modulesVisited[rowIndex][property] = cell.textContent.trim();
        } else {
            // Update other properties directly in student_data
            student_data[property] = cell.textContent.trim();
        }

        // Save the updated student data
        await saveStudentData(student_data);
        console.log("Student data saved:", student_data);
    } catch (error) {
        console.error("Error handling cell input:", error);
    }
}

function removeInlineEditListeners() {
    document.querySelectorAll('[contenteditable="true"]').forEach((cell) => {
        cell.removeEventListener("input", handleCellInput);
    });
}

async function resetModules() {
    try {
        // Ask for confirmation before clearing data
        const isConfirmed = window.confirm("Alle manuellen Änderungen löschen?");

        if (!isConfirmed) {
            // User canceled the operation
            return;
        }

        // Clear all local storage data for the extension
        const storage = typeof browser !== 'undefined' ? browser.storage.sync : chrome.storage.sync;
        await storage.clear();

        // Reload the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const activeTab = tabs[0];
            chrome.tabs.reload(activeTab.id, { bypassCache: true }, function () {
                // Close the popup after initiating the reload
                window.close();
            });
        });

        console.log("Local storage data cleared successfully. Page reloaded.");
    } catch (error) {
        console.error("Error clearing local storage data:", error);
    }
}

async function start() {
    try {
        const student_data = await getStudentData();
        console.log("Student Data:", student_data);

        if (!student_data) {
            console.error("Error retrieving student data.");
            return;
        }

        const studyProgramDropdown = document.getElementById('studyProgram');
        const studyScheduleDropdown = document.getElementById('studySchedule');
        const startSemesterDropdown = document.getElementById('startSemester');
        const studyMajorDropdown = document.getElementById('studyMajor');

        populateStudyMajorDropdown(studyMajorDropdown, student_data.studyProgram);
        studyMajorDropdown.value = student_data.studyMajor || '';
        populateSemesterDropdown(startSemesterDropdown);
        startSemesterDropdown.value = student_data.startSemester || '';
        studyProgramDropdown.value = student_data.studyProgram || '';
        studyScheduleDropdown.value = student_data.studySchedule || '';

        displayMyStudies(student_data);
        displayModulesInTable(student_data);
        addDropdownChangeListeners('select[data-property]', handleDropdownChange, student_data);
        addInlineEditListeners('#module-table [contenteditable="true"]', handleCellInputModules, student_data);


        const moduleToRemoveDropdown = document.getElementById('moduleToRemove');
        populateModuleDropdown(moduleToRemoveDropdown, student_data.modulesVisited);

        setupRemoveModuleButton();

        const resetManualEditsBtn = document.getElementById('resetManualEditsBtn');
        resetManualEditsBtn.addEventListener('click', resetModules);

    } catch (error) {
        console.error("Error in start:", error);
    }
}

// Start the process
start();