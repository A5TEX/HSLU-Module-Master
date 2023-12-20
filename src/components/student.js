
/**
 * Represents a student.
 *
 * This class encapsulates the data and operations related to a student.
 * It includes properties for the student's start semester, study schedule, study program, study major, and visited modules.
 * It also includes methods for setting the start semester, getting the visited modules, calculating the average grade, calculating the average grade per semester, adding passed modules, getting the ECTS obtained by module type, getting the total ECTS obtained, and getting the ECTS obtained per semester.
 *
 * @constructor
 * @param {Object} studentJSON - The JSON object containing the student data.
 */
class Student {
    constructor(studentJSON) {
        let student = studentJSON;
        this.startSemester = student.startSemester;     // Studienstart (F22, H22, F23, H23, F24, H24, …)
        this.studySchedule = student.studySchedule;     // Studienmodell (Vollzeit/Teilzeit)
        this.studyProgram = student.studyProgram;       // Studiengang (ICS, AIML, I, WI, DI)
        this.studyMajor = student.studyMajor;           // Major/Minor
        this.modulesVisited = student.modulesVisited;   // Liste der besuchten Module
    }

    /**
     * Set the startSemester property.
     * @param {*} startSemester 
     */
    setStartSemester(startSemester) {
        this.startSemester = startSemester;
    }

    /**
     * Returns the modules visited as an array of "Module" objects.
     */
    getModulesVisited() {
        return this.modulesVisited;
    }

    /**
     * Calculates and returns the average grade of the student.
     *
     * This function iterates over the modules visited by the student.
     * For each module, it checks if the grade is not null and is a number. If true, it adds the product of the grade and the ECTS of the module to a running total and also adds the ECTS of the module to a running total of ECTS.
     * If the grade is a string convertible to a valid number and not equal to 0, it follows the same process.
     * The function then divides the total weighted grade by the total ECTS to get the average grade.
     * If the student has not visited any modules or all the grades are null, not numbers, or 0, this function returns NaN.
     *
     * @returns {number} The average grade of the student, or NaN if the student has not visited any modules or all the grades are null, not numbers, or 0.
     */
    getAverageGrade() {
        let gradesSumWeighted = 0;
        let ECTS = 0;

        for (let module of this.modulesVisited) {
            let note = parseFloat(module.note);

            if (!isNaN(note) && note !== 0) {
                gradesSumWeighted += note * module.ects;
                ECTS += module.ects;
            } else if (typeof module.note === 'string' && !isNaN(parseFloat(module.note))) {
                // Convert string to float and check if it's not 0
                note = parseFloat(module.note);
                if (note !== 0) {
                    gradesSumWeighted += note * module.ects;
                    ECTS += module.ects;
                }
            }
        }

        return ECTS !== 0 ? gradesSumWeighted / ECTS : NaN;
    }

    /**
     * Calculates and returns the average grade of the student for a specific semester.
     *
     * This method iterates over the modules visited by the student.
     * For each module, if the semester of the module matches the input semester, it adds the product of the grade and the ECTS of the module to a running total, and also adds the ECTS of the module to a running total of ECTS.
     * It then divides the total weighted grade by the total ECTS to get the average grade for the semester.
     * If the student has not visited any modules in the input semester, this method returns NaN.
     *
     * @param {string} semester - The semester for which to calculate the average grade.
     * @returns {number} The average grade of the student for the semester, or NaN if the student has not visited any modules in the semester.
     */
    getAverageGradePerSemester(semester) {
        let gradesSumWeighted = 0;
        let ECTS = 0;
        for (let module of this.modulesVisited) {
            if (module.semester == semester) {
                gradesSumWeighted += parseFloat(module.note) * parseFloat(module.ects);
                ECTS += parseFloat(module.ects);
            }
        }
        return gradesSumWeighted / ECTS;
    }

    /**
     * Manually adds passed modules to the array of modules visited.
     * @param {Module} module 
     */
    setAdditionalModulesPassed(module) {
        this.modulesVisited.push(module);
    }


    /**
     * Calculates and returns the total ECTS obtained by the student for a specific module type.
     *
     * This method iterates over the modules visited by the student.
     * For each module, if the module type matches the input module type and the grade is 4.0 or higher, it adds the ECTS of the module to a running total.
     * It then returns the total ECTS.
     *
     * @param {string} moduleType - The module type for which to calculate the total ECTS.
     * @returns {number} The total ECTS obtained by the student for the module type.
     */
    getEctsObtainedByModuletype(moduleType) {
        let ECTSperModuletype = 0;
        for (let module of this.modulesVisited) {
            // console.log(module.moduleName, module.moduleType, moduleType);
            if (module.moduleType === moduleType) {
                if (module.note >= 4.0) {
                    ECTSperModuletype += parseInt(module.ects, 10);
                }
            }
        }
        return ECTSperModuletype;
    }

    /**
     * Calculates and returns the total ECTS obtained by the student.
     *
     * This method iterates over the modules visited by the student.
     * For each module, if the grade is 4.0 or higher, it adds the ECTS of the module to a running total.
     * It then returns the total ECTS.
     *
     * @returns {number} The total ECTS obtained by the student.
     */
    getEctsObtainedTotal() {
        let totalECTS = 0;
        for (let module of this.modulesVisited) {
            if (module.note >= 4.0) {
                totalECTS += parseInt(module.ects, 10);
            }
        }
        return totalECTS;
    }

    /**
     * Calculates and returns the total ECTS obtained by the student for a specific semester.
     *
     * This method first initializes a variable to keep track of the total ECTS for the semester.
     * It then converts the input semester to an integer.
     * It iterates over the modules visited by the student.
     * For each module, if the semester of the module matches the input semester, it adds the ECTS of the module to the running total.
     * It then returns the total ECTS for the semester.
     *
     * @param {string} semester - The semester for which to calculate the total ECTS.
     * @returns {number} The total ECTS obtained by the student for the semester.
     */
    getEctsObtainedSemester(semester) {
        let ECTSperSemester = 0;
        semester = parseInt(semester, 10);

        for (let module of this.modulesVisited) {
            if (parseInt(module.semester, 10) === semester) {
                ECTSperSemester += parseInt(module.ects, 10);
            }
        }
        return ECTSperSemester;
    }
}

