const inputName = document.getElementById("todo-input");
const btnAdd = document.getElementById("add-btn");
const container = document.getElementById("todo-list");

let nameList = [];

function updateStorage() {
    let arrToText = JSON.stringify(nameList);
    localStorage.setItem("todo_tasks", arrToText);
}

function createLi(text) {
    let li = document.createElement("li");
    li.textContent = text + " ";

    let btnDelete = document.createElement("button");
    btnDelete.textContent = "ลบ";

    btnDelete.addEventListener("click", () => {
        li.remove();
        nameList = nameList.filter(item => item !== text);
        updateStorage();
    });

    li.appendChild(btnDelete);
    return li;
}

btnAdd.addEventListener("click", () => {
    let text = inputName.value.trim();
    if (text === "") return;

    let newLi = createLi(text);
    container.appendChild(newLi);

    nameList.push(text);
    updateStorage();

    inputName.value = "";
});

window.onload = () => {
    container.innerHTML = "";

    let data = localStorage.getItem("todo_tasks");
    if (data) {
        let arr = JSON.parse(data);
        arr.forEach(item => {
            let newLi = createLi(item);
            container.appendChild(newLi);
            nameList.push(item);
        });
    }
};