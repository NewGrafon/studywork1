
    const profilePic = [document.querySelector('.profile_pic'), document.querySelector('.profile_pic_menu')];
    profilePic[0].addEventListener('mouseover', function () {
        document.querySelector('.profile_pic_menu').style.display = 'flex';
    })

    profilePic[0].addEventListener('mouseout', function () {

        document.querySelector('.profile_pic_menu').style.display = 'none';
    })

    profilePic[1].addEventListener('mouseover', function () {
        document.querySelector('.profile_pic_menu').style.display = 'flex';
    })

    profilePic[1].addEventListener('mouseout', function () {
        document.querySelector('.profile_pic_menu').style.display = 'none';
    })

    let   accountBtn = document.querySelector('#accountBtn'),
          userSchoolsBtn = document.querySelector('#userSchoolsBtn'),
          adminBtn = null;
          if(document.querySelector('#adminBtn')) {adminBtn = document.querySelector('#adminBtn');}
          else {document.querySelector('.profile_pic_menu').style.height = '96px';}

    accountBtn.addEventListener('click', function (){
        window.location.href = '/profile';
    });

    userSchoolsBtn.addEventListener('click', function (){
        window.location.href = '/yourSchools';
    });

    if (adminBtn)
        adminBtn.addEventListener('click', function (){
            window.location.href = '/adminPanel';
        });


