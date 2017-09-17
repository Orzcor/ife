;(function IIFE(){
    let data = [{
        'city': '北京',
        'school': ['北京大学', '清华大学', '北京理工大学', '北京邮电大学', '中央财经大学']
    }, {
        'city': '天津',
        'school': ['天津大学', '南开大学', '天津理工大学', '天津财经大学', '天津财经大学']
    }, {
        'city': '上海',
        'school': ['上海大学', '复旦大学', '上海理工大学', '上海财经大学', '上海财经大学']
    }, {
        'city': '成都',
        'school': ['成都大学', '西南大学', '成都理工大学', '成都科技大学', '西南财经大学', '西华大学']
    }]

    let inRadio = document.getElementById('inSchool'),
        outRadio = document.getElementById('outSchool'),
        school = document.getElementById('j-school'),
        job = document.getElementById('j-job'),
        citySelect = document.getElementById('citySelect'),
        schoolSelect = document.getElementById('schoolSelect')


    inRadio.addEventListener('click', function(){
        school.style.display = 'flex'
        job.style.display = 'none'
    })

    outRadio.addEventListener('click', function(){
        school.style.display = 'none'
        job.style.display = 'flex'
    })
    
    function cityOption(){
        for(let i = 0, l = data.length; i < l; i++){
            let option = document.createElement('option')
            option.textContent = data[i].city
            option.value = data[i].city
            citySelect.appendChild(option)
        }
    }

    function schoolOption(index = 0){
        schoolSelect.innerHTML = ''
        let schoolList = data[index].school
        for(let i = 0, l = schoolList.length; i < l; i++){
            let option = document.createElement('option')
            option.textContent = schoolList[i]
            option.value = schoolList[i]
            schoolSelect.appendChild(option)
        }
    }

    cityOption()
    schoolOption()

    citySelect.addEventListener('change', function(){
        schoolOption(this.selectedIndex)
    })
})()