const Base_URL = "https://lighthouse-user-api.herokuapp.com";
const Index_URL = Base_URL + "/api/v1/users/";
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const paginator = document.querySelector("#paginator");
const NavigationBar = document.querySelector("#NavigationBar");
const breadcrumbSelect = document.querySelector("#breadcrumbSelect");
const peopleList = [];
let filteredPeople = [];
let genderData = [];
const listPerPage = 16;
let currentPage = 1


// 初始畫面渲染，抓取資料放入CARD中
axios.get(Index_URL).then((response) => {
  peopleList.push(...response.data.results);
  // renderPeopleList(getPersonListByPage(1));
  // createPage(peopleList)
  // loveColorChange()
  // console.log(searchForm)
  renderPaginator(peopleList.length)
  renderPeopleList(getPeopleByPage(peopleList))
})
  .catch(function (error) {
    console.log(error);
  });


//function 區

// 渲染person card list
function renderPeopleList(data) {
  dataPanel.innerHTML = '';

  data.forEach(item => {
    dataPanel.innerHTML += `<div class="col-12 col-md-3 mb-3">
            <div class="card">
              <img src="${item.avatar}" class="card-img-top img-fluid person-pic"
                title="See More" data-target="#personDetail" data-toggle="modal" data-id = '${item.id}'>
              <div class="card-body text-center">
                <h5 style = 'font-weight: bold' class="card-title">${item.name}</h5>
                <a class="btn btn-info myFavorite" id = '${item.id}'>Favorite</a>
              </div>
            </div>
          </div>`
  });
  changePageNumberColor(currentPage)
}


//modal內 personal資訊
function showPersonalInfoModal(id) {
  const modalName = document.querySelector("#modalName");
  const personalImage = document.querySelector("#personalImage");
  const personalInfo = document.querySelector("#personalInfo");
  const personalInfoFooter = document.querySelector("#personalInfoFooter");

  axios.get(Index_URL + id).then((response) => {
    const data = response.data;
    personalImage.innerHTML = `<img src="${data.avatar}" alt="avatarImage" class="image-fluid rounded">`;
    modalName.innerHTML = `<h5 class="modal-title">${data.name} ${data.surname}</h5>
    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>`;
    personalInfo.innerHTML = `<ul style="list-style-type:none;">
      <li>Age: ${data.age}</li>
      <li>Gender: ${data.gender}</li>
      <li>Birthday: ${data.birthday}</li>
      <li>Region: ${data.region}</li>
      <li>Email: ${data.email}</li>
    </ul>`;
    personalInfoFooter.innerHTML = `<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>`
  });
}

//建立頁碼
function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / listPerPage); //ceil()可以無條件進位
  paginator.innerHTML = '';

  for (let page = 0; page < numberOfPage; page++) {
    paginator.innerHTML += `<li class="page-item "><a class="page-link" href="#" data-page = '${page + 1
      }'>${page + 1}</a></li>`;
  } //要綁在超連結的上面
  currentPage = 1;
}


// 點按分頁時，會切出此頁該顯示的資料
function getPeopleByPage(data) {
  const listIndexStart = (currentPage - 1) * listPerPage;
  return data.slice(listIndexStart, listIndexStart + listPerPage);
}


//點擊分頁時會使目前的分頁改變顏色，放在renderPeopleList function內
function changePageNumberColor(pageNumber) {
  const paginatorArr = paginator.children;  //HTMLCollection是否要轉為純陣列？
  for (let i = 0; i < paginatorArr.length; i++) {
    paginatorArr[i].children[0].classList.remove("fas", 'fa-dog');
  }
  paginatorArr[pageNumber - 1].children[0].classList.add("fas", 'fa-dog');
}


//選擇清單中的性別
function selectGender(gender) {
  const totalData = filteredPeople.length ? filteredPeople : peopleList;
  if (gender === 'All') {
    genderData = []
    renderPaginator((filteredPeople.length ? filteredPeople : peopleList).length)
    return renderPeopleList(getPeopleByPage(filteredPeople.length ? filteredPeople : peopleList))
  }
  genderData = totalData.filter(item => {
    return item.gender === gender
  })
  if (genderData.length === 0) {
    return alert(`oops! no ${gender}`)
  }
  // console.log(genderData)
  renderPaginator(genderData.length)
  renderPeopleList(getPeopleByPage(genderData))
}


//添加到最愛的功能
function addToFavorite(id) {
  const data = JSON.parse(localStorage.getItem("favoriteNanny")) || [];
  const favorData = peopleList.find(item => {
    return item.id === id; //因為字串與數字型態不同所以一定要先把id數字化
  });

  if (data.some(item => item.id === id)) {
    return alert('This person has been added to favorites')
  }

  data.push(favorData);

  localStorage.setItem("favoriteNanny", JSON.stringify(data));
}





//監聽事件區
//點按觀看更多與加入最愛之監聽器
dataPanel.addEventListener("click", function onClick(event) {
  if (event.target.matches(".person-pic")) {
    showPersonalInfoModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".myFavorite")) {
    console.log(Number(event.target.id))
    addToFavorite(Number(event.target.id))
  }
});


// 搜尋功能的監聽事件
searchForm.addEventListener("click", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  //新增temporaryStorage，因為查詢若為搜尋不到結果，filter一樣會將空的資料存入filteredMovies中，這樣去切換模式時，它會去選擇movies變數的資料去切換成原本的所有資料！所以設計一個只在這個function中暫存的變數，判定是否要將資料推入filteredMovies中！
  const temporaryStorage = peopleList.filter((item) => {
    return item.name.toLowerCase().includes(keyword);
  }); //在 include() 中傳入空字串，所有項目都會通過篩選

  if (temporaryStorage.length === 0) {
    return alert("很抱歉！ 搜尋不到這位毛孩褓姆噢！");
  }

  filteredPeople = temporaryStorage;
  genderData = []
  renderPaginator(filteredPeople.length)
  renderPeopleList(getPeopleByPage(filteredPeople))
});



//監聽是否click頁碼
paginator.addEventListener("click", function onPageClick(event) {
  if (event.target.tagName === "A") {
    //tagName若為HTML則要寫大寫
    currentPage = Number(event.target.dataset.page);
    const finalData = genderData.length ? genderData : filteredPeople.length ? filteredPeople : peopleList;
    renderPeopleList(getPeopleByPage(finalData));
  }
});


//監聽導覽列的清單點擊事件
NavigationBar.addEventListener('click', function onClickBar(event) {
  alert('目前尚未開放，正在趕工中 >_<""')
})



//點擊性別選擇器
breadcrumbSelect.addEventListener('click', function onSelectClick(event) {
  selectGender(event.target.innerText)
  console.log(event.target.innerText)

})


