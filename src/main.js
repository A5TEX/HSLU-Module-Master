// main script

// Create the DataExtractor Object
const dataExtractor = new DataExtractor(
  "https://hslu-study-data.ch",
  "44f9a67d3b6d540c474f6c6d126fedde"
);

// Define global variables
let contentGenerator = null;
let student = null;
let visitedModules = null;
let modules = null;
let ectsResult_from_API = null;
const creditsByType = {};
const main_container = document.getElementById("wrapper").querySelector(".relative.site_content.no-mood").querySelector(".row");

/**
 * Asynchronously displays the content of the extension.
 *
 * This function first creates a loading animation and logs a loading message.
 * It then attempts to get the student data from the local storage, with a timeout of 1 second.
 * If the timeout is reached, it extracts the student data from the webpage and saves it to the local storage.
 * It then creates a Student object from the student data.
 * If the student's study program is not null, it gets the required ECTS per module type for the study program.
 * It then creates a semester select dropdown and appends it to the main container.
 * It gets the modules visited by the student and the ECTS obtained by the student for each module type.
 * It then displays the visited modules and the timetable, and generates the modules by semester.
 * Finally, it hides the loading animation.
 *
 * @async
 */
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
      timeout(1000)
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

  if (student.studyProgram !== null) {
    let studyProgram = student.studyProgram.toLowerCase();
    ectsResult_from_API = await dataExtractor.get_required_ects_per_moduletype(studyProgram);
  }

  // Create the semester select dropdown
  await createSemesterSelect();

  visitedModules = student.getModulesVisited();
  creditsByType.Kernmodule = student.getEctsObtainedByModuletype("Kernmodul");
  creditsByType.Projektmodule = student.getEctsObtainedByModuletype("Projektmodul");
  creditsByType.Majormodule = student.getEctsObtainedByModuletype("Major-/Minormodul");
  creditsByType.Erweiterungsmodule = student.getEctsObtainedByModuletype("Erweiterungsmodul");
  creditsByType.Zusatzmodule = student.getEctsObtainedByModuletype("Zusatzmodul");

  contentGenerator.displayTimetable(visitedModules);
  contentGenerator.displayModuleMaster(visitedModules, student.getAverageGrade(), student.getEctsObtainedTotal(), creditsByType, ectsResult_from_API, student.studyProgram);

  // Get the modules from the DataExtractor
  const currentDate = new Date();
  contentGenerator.generateModulesBySemester(await dataExtractor.get_modules_by_semester(dataExtractor._get_semester_from_date(currentDate)), student.studyProgram, visitedModules);

  // Hide the loading indicator
  var loadingAnimation = document.getElementById("loading-animation");
  loadingAnimation.style.display = "none";

  // Cleanup HTML intro text
  const h1StrongElements = document.querySelectorAll('h1 strong');
  const introElement = document.querySelector('.richtext.columns.intro');
  if (introElement) {
    introElement.remove();
  }
  h1StrongElements.forEach(element => {
    element.remove();
  });

}

/**
 * Asynchronously creates a select field for semesters and appends it to the main container.
 *
 * This function first creates a select field and assigns it an id of 'semester-select'.
 * It then gets a list of semesters from the DataExtractor and adds each semester as an option to the select field.
 * It sets the default selected semester based on the current month.
 * It adds an event listener to the select field that triggers when the selected semester changes.
 * When the selected semester changes it displays the timetable and creates a loading animation.
 * It then gets the modules for the selected semester from the DataExtractor and generates the modules by semester.
 * Finally, it hides the loading animation and appends the select field to the main container.
 *
 * @async
 */
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
  semesterSelect.value = dataExtractor._get_semester_from_date(new Date());

  // Add an event listener to the semester select field
  semesterSelect.addEventListener("change", async () => {
    contentGenerator.clearView();
    contentGenerator.displayTimetable(visitedModules);
    contentGenerator.createLoadingAnimation();
    // Get the current value of the semesterSelect element
    let selectedSemester = semesterSelect.value;

    // Get the modules from the DataExtractor
    contentGenerator.generateModulesBySemester(await dataExtractor.get_modules_by_semester(selectedSemester) || [], student.studyProgram, visitedModules);

    // Hide the loading indicator
    var loadingAnimation = document.getElementById("loading-animation");
    loadingAnimation.style.display = "none";
  });

  startElement.appendChild(semesterSelect);
}

// Call the main function
displayContent();
