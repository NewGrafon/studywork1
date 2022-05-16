try {
    let currentInfoZone = 0;
    const infoZoneBtns = [document.querySelector('#p_z_descBtn'), document.querySelector('#p_z_waysBtn') || null];
    const infoZones = [document.querySelector('.p_z_info_contentZones_fullInfo'), document.querySelector('.p_z_info_contentZones_ways') || null];
    function infoZoneChanger (id) {
        if (currentInfoZone === id) return;
    
        infoZones[currentInfoZone].classList.add('not_active');
        infoZones[id].classList.remove('not_active');

        infoZoneBtns[currentInfoZone].classList.remove('p_z_info_activeSelector');
        infoZoneBtns[id].classList.add('p_z_info_activeSelector');

        currentInfoZone = id;
    }

    infoZoneBtns[0].addEventListener('click', () => {infoZoneChanger(0)})
    infoZoneBtns[1].addEventListener('click', () => {infoZoneChanger(1)})
    
    /////////////////////////////////////////////////////

    let currentWaysZone = 0;

    const waysUniversalList = document.querySelector('.colleges_or_vuzs_btns');
    waysUniversalList.addEventListener('click', (elem) => {
        let targetElem = elem.target;
        if (targetElem.closest('.ways_btn')) {
            if ((targetElem.id).substring(0, 7) == 'college') {
                if (currentWaysZone === parseInt(targetElem.id)) return

                document.querySelector(`#colleges_btn${ currentWaysZone }`).classList.remove('p_z_info_activeSelector');
                document.querySelector(`#college_list${ currentWaysZone }`).classList.add('not_active');

                (targetElem).classList.add('p_z_info_activeSelector');
                document.querySelector(`#college_list${ (targetElem.id).substring( (targetElem.id).length - 1 ) }`).classList.remove('not_active');

                currentWaysZone = parseInt((targetElem.id).substring( (targetElem.id).length - 1 ));
            }

            if ((targetElem.id).substring(0, 4) == 'vuzs') {
                if (currentWaysZone === parseInt(targetElem.id)) return

                document.querySelector(`#vuzs_btn${ currentWaysZone }`).classList.remove('p_z_info_activeSelector');
                document.querySelector(`#vuzs_list${ currentWaysZone }`).classList.add('not_active');

                (targetElem).classList.add('p_z_info_activeSelector');
                document.querySelector(`#vuzs_list${ (targetElem.id).substring( (targetElem.id).length - 1 ) }`).classList.remove('not_active');

                currentWaysZone = parseInt((targetElem.id).substring( (targetElem.id).length - 1 ));
            }
        }
    })

    /* ИНИЦИАЛИЗАЦИЯ СТАТУСОВ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ */
    {
        const waysArr = [document.querySelectorAll('.college') || null, document.querySelectorAll('.vuz') || null];
        if (waysArr[0].length !== 0) { 
            const btn = waysArr[0][0]; 
            btn.classList.add('p_z_info_activeSelector');

            document.querySelector( `#college_list${ (btn.id).substring( (btn.id).length - 1 ) }` ).classList.remove('not_active');
        }
        if (waysArr[1].length !== 0) { 
            const btn = waysArr[1][0]; 
            btn.classList.add('p_z_info_activeSelector');

            document.querySelector( `#vuzs_list${ (btn.id).substring( (btn.id).length - 1 ) }`).classList.remove('not_active');
        }
    }

} catch (e) { console.log(e) }