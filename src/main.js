// main script

// Create the DataExtractor Object
const dataExtractor = new DataExtractor(
  "https://hslu-study-data.ch",
  "44f9a67d3b6d540c474f6c6d126fedde"
);

let contentGenerator = null;
let student = null;
let visitedModules = null;
let modules = null;
let ectsResult_from_API = null;
const creditsByType = {};
const main_container = document.getElementById("wrapper").querySelector(".relative.site_content.no-mood").querySelector(".row");

async function displayContent() {
  contentGenerator = new ContentGenerator();
  contentGenerator.createLoadingAnimation();
  console.log("Extension is loading...");

  // Get the student data from the local storage
  const timeout = (ms) => new Promise((resolve, reject) => setTimeout(() => reject(new Error('Timeout')), ms));
  let student_data = null;
  try {
    student_data = await Promise.race([
      dataExtractor.get_student_data(),
      timeout(2000)
    ]);
  } catch {
    // If the timeout is reached, extract the student data from the webpage
    console.log("Timeout while fetching student data from local storage. Extracting from Webpage...");
    student_data = await dataExtractor.extract_student_data();
    console.log("Student data extracted from webpage: ", student_data);
    await dataExtractor.save_student_data(student_data);
  }

  // Create the Student Object
  student = new Student(student_data);
  // Create the ContentGenerator Object
  let studyProgram = student.studyProgram.toLowerCase();
  ectsResult_from_API = await dataExtractor.get_required_ects_per_moduletype(studyProgram);

  await createSemesterSelect();
  createSemesterCheckBox();

  visitedModules = student.getModulesVisited();
  creditsByType.Kernmodule = student.getEctsObtainedByModuletype("Kernmodul");
  creditsByType.Erweiterungsmodule = student.getEctsObtainedByModuletype("Erweiterungsmodul");
  creditsByType.Zusatzmodule = student.getEctsObtainedByModuletype("Zusatzmodul");
  creditsByType.Projektmodule = student.getEctsObtainedByModuletype("Projektmodul");
  creditsByType.Major_Minormodule = student.getEctsObtainedByModuletype("Major-/Minormodul");

  contentGenerator.displayVisitedModules(visitedModules, student.getAverageGrade(), student.getEctsObtainedTotal(), creditsByType, ectsResult_from_API);
  contentGenerator.displayTimetable(visitedModules);

  // Get the modules from the DataExtractor
  contentGenerator.generateModulesBySemester(await dataExtractor.get_modules_by_semester(get_current_semester()) || []);

  // Hide the loading indicator
  var loadingAnimation = document.getElementById("loading-animation");
  loadingAnimation.style.display = "none";
}

async function createSemesterSelect() {
  let startElement = main_container;
  // Create the semester select field
  let semesterSelect = document.createElement("select");
  semesterSelect.id = "semester-select";

  // Add semesters to the select field
  let semesters = await dataExtractor.get_semester_list();
  semesters.forEach((semester) => {
    let option = document.createElement("option");
    option.value = semester;
    option.text = semester;
    semesterSelect.appendChild(option);
  });

  // Set the default selected semester based on the current month
  semesterSelect.value = get_current_semester();

  // Add an event listener to the semester select field
  semesterSelect.addEventListener("change", async () => {
    // clearView();
    contentGenerator.clearView();
    contentGenerator.displayTimetable(visitedModules);
    contentGenerator.displayVisitedModules(visitedModules, student.getAverageGrade(), student.getEctsObtainedTotal(), creditsByType, ectsResult_from_API);
    contentGenerator.createLoadingAnimation();
    // Get the current value of the semesterSelect element
    let selectedSemester = semesterSelect.value;

    // Get the modules from the DataExtractor
    contentGenerator.generateModulesBySemester(await dataExtractor.get_modules_by_semester(selectedSemester) || []);

    // Hide the loading indicator
    var loadingAnimation = document.getElementById("loading-animation");
    loadingAnimation.style.display = "none";
  });

  startElement.appendChild(semesterSelect);
}

function createSemesterCheckBox() {
  var parentElement = main_container;

  var semesterResults = document.createElement("div");
  semesterResults.id = "semester-results";

  // Create the checkbox input element
  var semesterCheckbox = document.createElement("input");

  // Set the attributes for the checkbox
  semesterCheckbox.type = "checkbox";
  semesterCheckbox.id = "semester-checkbox";
  semesterCheckbox.name = "semester-checkbox";

  // Optional: Create a label for the checkbox
  var label = document.createElement("label");
  label.htmlFor = "semester-checkbox";
  label.appendChild(document.createTextNode("Nur Module im gewählten Semester anzeigen"));

  // Append the checkbox and label to the parent element
  semesterResults.appendChild(label);
  semesterResults.appendChild(semesterCheckbox);

  parentElement.appendChild(semesterResults);

  // Add onchange event listener to the checkbox
  semesterCheckbox.onchange = function () {
    contentGenerator.displayVisitedModules(visitedModules, student.getAverageGrade(), student.getEctsObtainedTotal(), creditsByType, ectsResult_from_API);
  };
}

function get_current_semester() {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  return currentMonth >= 1 && currentMonth < 7
    ? `F${(currentYear % 100)}` // If current month is Feb-Jun, set to FYY
    : currentMonth >= 7
      ? `H${(currentYear % 100)}` // If current month is Jul-Dec, set to HYY
      : `H${(currentYear % 100) - 1}`; // If current month is Jan, set to H(YY - 1)
}

displayContent();
