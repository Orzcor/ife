;(function IIFE(){
    let data = [{
        'city': '北京',
        'school': ['北京大学', '清华大学', '北京理工大学', '北京邮电大学', '中央财经大学']
    }, {
        'city': '天津',
        'school': ['天津大学', '南开大学', '天津理工大学', '天津财经大学', '天津财经大学']
    }]

    let inRadio = document.getElementById('inSchool'),
        outRadio = document.getElementById('outSchool'),
        school = document.getElementById('j-school'),
        job = document.getElementById('j-job')


    inRadio.addEventListener('click', function(){
        school.style.display = 'flex'
        job.style.display = 'none'
    })

    outRadio.addEventListener('click', function(){
        school.style.display = 'none'
        job.style.display = 'flex'
    })
    
    
})()