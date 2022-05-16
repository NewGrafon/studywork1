try {
    let textarea = [document.querySelector('.lowName'), document.querySelector('.fullName'),
                    document.querySelector('.lowDesc'), document.querySelector('.fullDesc'),
                    document.querySelector('.educ_link')];

    for (let i = 0; i < textarea.length; i++) {
    textarea[i].addEventListener("input", OnInput, false);
    }

    function OnInput() {
        this.setAttribute('style', `height: ${this.scrollHeight}px !important;`);
    }
    
    ////////////////////////////////////////////////////////////////////////////////

    const schoolType = document.querySelectorAll('input[name="TypeOfSchool"]'),
          educType = document.querySelectorAll('input[name="EducType"]');
          educPrice = [document.getElementsByName('ePT_budget'), document.getElementsByName('ePT_paid')];

    ////////////////////////////////////////////////////////////////////////////////

    educType.forEach((elem, id) => {
        elem.addEventListener('change', function () {
            if (elem.checked)
            document.querySelector(`#ET${id}`).classList.add('SelectedInput');
            else
            document.querySelector(`#ET${id}`).classList.remove('SelectedInput');

            EducElemChecker(id);
        })
    })
    
    function EducElemChecker(id) {
        let allNotChecked = false;
        let count = 0;
        educType.forEach((elem) => {

            if (!elem.checked) count++;
            if (count === 5) allNotChecked = true;
        });
        if (allNotChecked) {
            educType[id].checked = true;
            document.querySelector(`#ET${id}`).classList.add('SelectedInput');
        }
    }



    {
        let countNotChecked = 0;
        educType.forEach(elem => {
            if (!elem.checked) countNotChecked++;
            if (countNotChecked === 5) {
                educType[0].checked = true;
                document.querySelector(`#ET${0}`).classList.add('SelectedInput');
            }
        }) 
    }

    ////////////////////////////////////////////////////////////////////////////////

    

    ////////////////////////////////////////////////////////////////////////////////

    //let selectedSchoolType;
    schoolType.forEach((elem, id) => {
        elem.addEventListener('change', function () {
            schoolTypeElemChecker(id);
            document.querySelector(`#ST${id}`).classList.add('SelectedInput');  
        })
    })

    const 
    collegesAndVuzsBtns = document.querySelector('#collegesAndVuzsBtns');

    const categoriesLeft = document.querySelector('#categoriesLeft'),
          categoriesRight = document.querySelector('#categoriesRight');
    let   collegesZone = 0, // 0 1
          vuzsZone = 0; // 0 1 2

    const proff = document.querySelectorAll('#proff'),
          specs = document.querySelectorAll('#specs'),
          bakalavriat = document.querySelectorAll('#bakalavriat'),
          magistratura = document.querySelectorAll('#magistratura'),
          specialitet = document.querySelectorAll('#specialitet');










    function schoolTypeElemChecker(id) {
        schoolType[selectedSchoolType].checked = false;
        document.querySelector(`#ST${selectedSchoolType}`).classList.remove('SelectedInput');
        selectedSchoolType = id;

        switch(selectedSchoolType) {
            case 0: 
                collegesAndVuzsBtns.classList.replace('activeCategories', 'not_active');
                ZonesChanger(selectedSchoolType)
                break;
            case 1: 
                collegesAndVuzsBtns.classList.replace('not_active', 'activeCategories');
                ZonesChanger(selectedSchoolType)
                break;
            case 2: 
                collegesAndVuzsBtns.classList.replace('not_active', 'activeCategories');
                ZonesChanger(selectedSchoolType)
                break;

            default:
                collegesAndVuzsBtns.classList.replace('activeCategories', 'not_active');
                ZonesChanger(0)
                break;
        }
    }

    schoolTypeElemChecker(selectedSchoolType);
    document.querySelector(`#ST${selectedSchoolType}`).classList.add('SelectedInput');
    document.querySelector(`#ST${selectedSchoolType}`).checked = true;  
    

    //////////////////////
    function ZonesChanger (selectedSchoolType) {
        if (true || selectedSchoolType === 0) // Сначала полное скрытие || Выбрана школа
        {
            for (let i=0; i<=1; i++) {
                proff[i].classList.add('not_active');
                specs[i].classList.add('not_active');
                bakalavriat[i].classList.add('not_active');
                magistratura[i].classList.add('not_active');
                specialitet[i].classList.add('not_active');
            }
        }

        if (selectedSchoolType === 1)
        {
            for (let i=0; i<=1; i++) {
                if (collegesZone === 0) proff[i].classList.remove('not_active');
                if (collegesZone === 1) specs[i].classList.remove('not_active');
            }                
        }
        if (selectedSchoolType === 2)
        {
            for (let i=0; i<=1; i++) {
                if (vuzsZone === 0) bakalavriat[i].classList.remove('not_active');
                if (vuzsZone === 1) magistratura[i].classList.remove('not_active');
                if (vuzsZone === 2) specialitet[i].classList.remove('not_active');
            }                
        }
    }
    //////////////////////





    categoriesLeft.addEventListener('click', ()=>{ZoneBtns('left')})
    categoriesRight.addEventListener('click', ()=>{ZoneBtns('right')})
    function ZoneBtns (way) {
        // colleges
        if (selectedSchoolType === 1) {
            if (way === 'left') collegesZone -= 1;
            if (way === 'right') collegesZone += 1;
            if (collegesZone < 0) collegesZone = 1;
            if (collegesZone > 1) collegesZone = 0;

            ZonesChanger(selectedSchoolType)
        }
        // vuzs
        if (selectedSchoolType === 2) {
            if (way === 'left') vuzsZone -= 1;
            if (way === 'right') vuzsZone += 1;
            if (vuzsZone < 0) vuzsZone = 2;
            if (vuzsZone > 2) vuzsZone = 0;

            ZonesChanger(selectedSchoolType)
        }
    }

    

    ////////////////////////////////////////////////////////////////////////////////


} catch (e) {console.log(e)}

