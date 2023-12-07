
/**
 * Student class.
 */
class Student {
    constructor(studentJSON) {
        let student = studentJSON;
        this.startSemester = student.startSemester;     // Studienstart (F22, H22, F23, H23, F24, H24, …)
        this.studySchedule = student.studySchedule;     // Studienmodell (Vollzeit/Teilzeit)
        this.studyProgram = student.studyProgram;       // Studiengang (ICS, AIML, I, WI)
        this.studyMajor = student.studyMajor;           // Major/Minor
        this.modulesVisited = student.modulesVisited;   // Liste der besuchten Module
    }

    setStartSemester(startSemester) {
        this.startSemester = startSemester;
    }

    /**
     * Returns the modules visited as an array of "Module" objects.
     */
    getModulesVisited() {
        return this.modulesVisited;
    }

    getAverageGrade() {
        let gradesSumWeighted = 0;
        let ECTS = 0;
        for (let module of this.modulesVisited) {
            if (module.note != null && !isNaN(module.note)) {
                gradesSumWeighted += module.note * module.ects;
                ECTS += module.ects;
            }
        }
        return gradesSumWeighted / ECTS;
    }


    /**
     * Returns the average grade of modules passed in the specified semester.
     * @param {*} semester 
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
     * 
     * @returns the total of ECTS obtained for this Student.
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

