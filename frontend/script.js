function clearAreas() {
    document.getElementById("form_area").innerHTML = "";
    document.getElementById("content_area").innerHTML = "";

    // remove all event listeners
    var new_form_area = document.getElementById("form_area");
    var new_content_area = document.getElementById("content_area");
    var old_form_area = new_form_area.cloneNode(true);
    var old_content_area = new_content_area.cloneNode(true);
    new_form_area.parentNode.replaceChild(old_form_area, new_form_area);
    new_content_area.parentNode.replaceChild(old_content_area, new_content_area);
}

function sendPostRequest(url, body) {
    // send post request to backend
    return fetch("http://127.0.0.1:8000/" + url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        return response.json();
    }).then(data => {
        return data;
    });
}

function sendGetRequest(url) {
    // send get request to backend
    return fetch("http://127.0.0.1:8000/" + url, {
        method: 'GET',
        // body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        return response.json();
    }).then(data => {
        return data;
    });
}


function getUserToken() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var url = "http://localhost:8080/api/user/login";
}

/*********************************************
 * Login functions
 *********************************************/
function showLogin() {
    clearAreas();
    // get user name, username,
    document.getElementById("form_area").innerHTML =
        "<h1>Create User</h1>" +
        "<form>" +
            "<label for='username'>Username:</label>" +
            "<input type='text' id='username' name='username' placeholder='Username'><br>" +
            "<label for='name' id='name_label'>Name:</label>" +
            "<input type='text' id='name' name='name' placeholder='Name'><br>" +
            "<label for='email'>Email:</label>" +
            "<input type='email' id='email' name='email' placeholder='Email'><br>" +
            "<button type='submit' id='login_button'>Submit</button>" +
        "</form>";

    // add event listener to login button
    document.getElementById("login_button").addEventListener("click", function(event) {
        event.preventDefault();
        var username = document.getElementById("username").value;
        var name = document.getElementById("name").value;
        var email = document.getElementById("email").value;
        var body = {
            "username": username,
            "name": name,
            "email": email
        };
        console.log(body);
        sendPostRequest("create-user", body).then(responseData => {
            console.log(responseData);
            document.getElementById("content_area").innerHTML = "<p>{ user_id:" + responseData.user_id + "}</p>";
        });
    });
}

/*********************************************
 * Show all recipes functions
 *********************************************/
function addRecipeToContentArea(data, i) {
    console.log(data);
    let newDiv = document.createElement("div");
    newDiv.id = "recipe" + i;
    newDiv.innerHTML = "<br><h2>" + data.name + "</h2>" +
        "<p>id: " + data.id + "</p>" +
        "<p>Ingredients:</p>" +
        "<ul>";
    for (let j = 0; j < data.ingredients.length; j++) {
        newDiv.innerHTML += "<li>" + data.ingredients[j].name + " " + data.ingredients[j].qty + " " + data.ingredients[j].unit + "</li>";
    }
    newDiv.innerHTML += "</ul>" +
        "<p>steps:</p>" +
        "<ol>";
    for (let j = 0; j < data.steps.length; j++) {
        newDiv.innerHTML += "<li>" + data.steps[j].text + "</li>";
    }
    newDiv.innerHTML += "</ol>";
    newDiv.innerHTML += "<img src='" + data.image_src + "' alt='recipe image' height='200'>";
    document.getElementById("content_area").appendChild(newDiv);
}

function getAllRecipes() {
    clearAreas();
    sendGetRequest("all-recipes").then(data => {
        console.log(data);
        // loop through all recipes and display them
        for (let i = 0; i < data.length; i++) {
            addRecipeToContentArea(data[i], i);
        }
    });
}

function showAllRecipes() {
    clearAreas();
    document.getElementById("form_area").innerHTML = "<h1>All Recipes</h1>" +
        // button to get all recipes
        "<button type='button' onclick='getAllRecipes()'>Get All Recipes</button>";
    document.getElementById("content_area").innerHTML = "";
}

/*********************************************
 * Adding a recipe functions
 *********************************************/
function createIngredientsInput() {
    const ingredientsNum = document.getElementById("ingredients_area").childElementCount;
    let newDiv = document.createElement("div");
    newDiv.id = "ingredient" + ingredientsNum + "wrapper";
    newDiv.innerHTML = "<input type='text' id='ingredient" + ingredientsNum + "' name='ingredient" + ingredientsNum + "' placeholder='Ingredient Name'>" +
        "<input type='text' id='ingredient" + ingredientsNum + "qty' name='ingredient" + ingredientsNum + "qty' placeholder='Ingredient QTY'>" +
        // dropdown for units
        "<select id='ingredient" + ingredientsNum + "unit' name='ingredient" + ingredientsNum + "unit'>" +
        "   <option value='' selected disabled hidden>Unit</option>" +
        "   <option value=''>none</option>" +
        "   <option value='tsp'>tsp</option>" +
        "   <option value='tbsp'>tbsp</option>" +
        "   <option value='cup'>cup</option>" +
        "   <option value='oz'>oz</option>" +
        "   <option value='cans'>cans</option>" +
        "   <option value='lb'>lb</option>" +
        "   <option value='g'>g</option>" +
        "   <option value='kg'>kg</option>" +
        "   <option value='ml'>ml</option>" +
        "   <option value='l'>L</option>" +
        "</select>";
    document.getElementById("ingredients_area").appendChild(newDiv);
}

function createStepsInput() {
    const stepsNum = document.getElementById("steps_area").childElementCount;
    // create a new list item of a new step
    let newLi = document.createElement("li");
    // newLi.innerHTML = "<textarea id='step" + stepsNum + "' name='step" + stepsNum + "'>";
    newLi.innerHTML = "<input type='text' id='step" + stepsNum + "' name='step" + stepsNum + "' placeholder='step'>";
    document.getElementById("steps_area").appendChild(newLi);
}

function createRecipe() {
    const recipeName = document.getElementById("recipe_name").value;
    const recipeDescription = document.getElementById("recipe_description").value;
    const recipeImage = document.getElementById("recipe_image").value;
    let ingredients = [];
    let steps = [];
    // get all ingredients
    for (let i = 0; i < document.getElementById("ingredients_area").childElementCount; i++) {
        let ingredientName = document.getElementById("ingredient" + i).value;
        let ingredientQty = document.getElementById("ingredient" + i + "qty").value;
        let ingredientUnit = document.getElementById("ingredient" + i + "unit").value;
        ingredients.push({
            "name": ingredientName,
            "qty": ingredientQty,
            "unit": ingredientUnit
        });
    }
    // get all steps
    for (let i = 0; i < document.getElementById("steps_area").childElementCount; i++) {
        let text = document.getElementById("step" + i).value;
        steps.push({
            "text": text,
            "step_num": i,
        });
    }
    // create recipe object
    let recipe = {
        "name": recipeName,
        "description": recipeDescription,
        "image_src": recipeImage,
        "ingredients": ingredients,
        "steps": steps
    };
    console.log(recipe);
    updateRecipeContentArea(sendPostRequest("create-recipe", recipe));
}

function updateRecipeContentArea(responseData) {
    // output the recipe to the content area
    responseData.then(data => {
            document.getElementById("content_area").innerHTML = "<p>" + data.message + "</p>";
    })

}

function showAddRecipe() {
    clearAreas();
    document.getElementById("form_area").innerHTML = "<h1>Add Recipe</h1>" +
        "<form>" +
        "   <label for='recipe_name'>Recipe Name:</label>" +
        "   <input type='text' id='recipe_name' name='recipe_name'><br><br>" +
        "   <label for='recipe_description'>Recipe Description:</label>" +
        "   <input type='text' id='recipe_description' name='recipe_description'><br><br>" +
        "   <div id='ingredients_area'></div><br>" +
        "   <input type='button' value='Add Ingredient' onclick='createIngredientsInput()'><br><br>" +
        "   <div id='steps_wrapper'>" +
        "       <ol id='steps_area'></ol>" +
        "   </div><br>" +
        "   <input type='button' value='Add step' onclick='createStepsInput()'><br><br>" +
        "   <label for='recipe_image'>Recipe Image Link:</label>" +
        "   <input type='text' id='recipe_image' name='recipe_image'><br><br>" +
        "   <button type='button' onclick='createRecipe()'>Create Recipe</button>";
    document.getElementById("content_area").innerHTML = "";
}

/*********************************************
 * Show all users functions
 *********************************************/
function showAllUsers() {
    clearAreas();
    // TODO get all users from backend
    // TODO display all users in content area
    document.getElementById("form_area").innerHTML = "<h1>All Users</h1>";
    document.getElementById("content_area").innerHTML = "<p>All Users Content area</p>";
}

/*********************************************
 * Show all recipe searches functions
 *********************************************/
function buildRecipeSearchForm() {
    // radio buttons for search type
    let searchType = "<div id='search_type'>" +
        "   <input type='radio' id='search_by_name' name='search_type' value='name' checked>" +
        "   <label for='search_by_name'>Search by Name</label><br>" +
        "   <input type='radio' id='search_by_ingredients' name='search_type' value='ingredients'>" +
        "   <label for='search_by_ingredients'>Search by Ingredients (Separate with commas, no spaces)</label><br>";
    // search by ingredients
    let searchTextInput = "<div id='search_by_ingredients_area'>" +
        "   <label for='search_by_ingredients'>Search Text:</label>" +
        "   <input type='text' id='search_text' name='ingredients'>" +
        "</div>";
    // get search limit
    let searchLimit = "<div id='search_limit'>" +
        "   <label for='search_limit'>Search Limit:</label>" +
        "   <input type='number' id='search_limit' name='search_limit' value='10'>" +
        "</div>";
    // search button
    let searchButton = "<input type='button' value='Search' onclick='searchRecipes()'>";
    // build form
    let form = searchType + searchTextInput + searchLimit + searchButton;
//    append form to form area
    document.getElementById("form_area").innerHTML = "<h1>Search Recipes:</h1>" + form;

}

function searchRecipes() {
    // get search type
    let searchType = document.querySelector('input[name="search_type"]:checked').value;
    // get search value
    let searchValue = document.getElementById("search_text").value;
    // get search limit
    let searchLimit = document.getElementById("search_limit").value;
    searchLimit = 10;
    // create search object
    let search = {
        "search_type": searchType,
        "search_text": searchValue,
        "limit": searchLimit
    };
    console.log(search);
    // send search to backend
    console.log(sendPostRequest("search-recipes", search));
    sendPostRequest("search-recipes", search).then(data => {
        // TODO display results in content area
        for (let i = 0; i < data.length; i++) {
            addRecipeToContentArea(data[i], i);
        }

    });
}

function showRecipeSearch() {
    clearAreas();
    // document.getElementById("form_area").innerHTML = "";
    buildRecipeSearchForm();
    document.getElementById("content_area").innerHTML = "";
}

/*********************************************
 * Show create meal plan functions
 *********************************************/
function stringifyDate(date) {
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        return year + "-" + month + "-" + day;
    }
function createMealPlan() {
    // prevent default form submission

    // get meal plan name
    let mealPlanName = document.getElementById("meal_plan_name").value;
    // get meal plan start date
    let mealPlanStartDate = document.getElementById("start_date").value;
    // get meal plan end date
    let mealPlanEndDate = document.getElementById("end_date").value;
    // get meal plan user id
    let mealPlanUserId = document.getElementById("user_id").value;

    // create date object for start and end dates
    let startDate = new Date(mealPlanStartDate);
    let endDate = new Date(mealPlanEndDate);

    // send meal plan to backend
    let mealPlan = {
        "name": mealPlanName,
        "start_date": stringifyDate(startDate),
        "end_date": stringifyDate(endDate),
        "user_id": mealPlanUserId
    }
    // send meal plan to backend
    sendPostRequest("create-meal-plan", mealPlan).then(r => {
        console.log(r);
        // TODO display meal plan in content area
        document.getElementById("content_area").innerHTML = "<p>Meal Plan Created</p>";
    });
}

function reuseMealPlan(name, start_date, end_date, user_id) {
    // create date object for start and end dates
    let startDate = new Date(start_date);
    let endDate = new Date(end_date);

    // send meal plan to backend
    let mealPlan = {
        "name": name,
        "start_date": stringifyDate(startDate),
        "end_date": stringifyDate(endDate),
        "user_id": user_id
    }
    // send meal plan to backend
    sendPostRequest("create-meal-plan", mealPlan).then(r => {
        // create a new div and append it to the body
        let newDiv = document.createElement("div");
        newDiv.innerHTML = "<p>Meal Plan Created</p>";
        document.body.appendChild(newDiv);
    });
}

function showCreateMealPlan() {
    clearAreas();
    document.getElementById("form_area").innerHTML = "<h1>Create Meal Plan</h1>" +
        "<form>" +
        "   <label for='meal_plan_name'>Meal Plan Name:</label>" +
        "   <input type='text' id='meal_plan_name' name='meal_plan_name'><br><br>" +
        "   <label for='start_date'>Start Date:</label>" +
        "   <input type='date' id='start_date' name='start_date'><br><br>" +
        "   <label for='end_date'>End Date:</label>" +
        "   <input type='date' id='end_date' name='end_date'><br><br>" +
        "   <label for='user_id'>User ID:</label>" +
        "   <input type='number' id='user_id' name='user_id'><br>" +
        "   <input type='submit' value='Submit'>" +
        "</form>";

    // add event listener to form
    document.getElementById("form_area").addEventListener("submit", function (event) {
        event.preventDefault();
        createMealPlan();
    });

    document.getElementById("content_area").innerHTML = "<p>Create Meal Plan Content area</p>";
}

function addEntryToMealPlan() {
    // get meal plan id
    let mealPlanId = document.getElementById("meal_plan_id").value;
    // get recipe id
    let recipeId = document.getElementById("recipe_id").value;
    // get meal plan entry date
    let mealPlanEntryDate = new Date(document.getElementById("meal_date").value);
    // get meal plan entry meal type
    let mealPlanEntryMealType = document.getElementById("meal_type").value;

    // create meal plan entry object
    let mealPlanEntry = {
        "mealplan_id": mealPlanId,
        "date": stringifyDate(mealPlanEntryDate),
        "meal": mealPlanEntryMealType,
        "recipe_id": recipeId
    }

    // send meal plan entry to backend
    sendPostRequest("add-to-meal-plan", mealPlanEntry).then(r => {
        console.log(r);
        // TODO display meal plan entry in content area
        document.getElementById("content_area").innerHTML = "<p>Meal Plan Entry Added</p>";
    });
}

function showAddEntryToMealPlan() {
    clearAreas();
    document.getElementById("form_area").innerHTML = "<h1>Add Entry to Meal Plan</h1>" +
        "<form>" +
        "   <label for='meal_plan_id'>Meal Plan ID:</label>" +
        "   <input type='number' id='meal_plan_id' name='meal_plan_id'><br><br>" +
        "   <label for='recipe_id'>Recipe ID:</label>" +
        "   <input type='text' id='recipe_id' name='recipe_id'><br><br>" +
        "   <label for='meal_date'>Meal Date:</label>" +
        "   <input type='date' id='meal_date' name='meal_date'><br><br>" +
        "   <label for='meal_type'>Meal Type:</label>" +
        "   <select id='meal_type' name='meal_type'>" +
        "       <option value='breakfast'>Breakfast</option>" +
        "       <option value='lunch'>Lunch</option>" +
        "       <option value='dinner'>Dinner</option>" +
        "   </select><br><br>" +
        "   <input type='submit' value='Submit'>" +
        "</form>";

    // add event listener to form
    document.getElementById("form_area").addEventListener("submit", function (event) {
        event.preventDefault();
        addEntryToMealPlan();
    });

    document.getElementById("content_area").innerHTML = "<p>Add Entry to Meal Plan Content area</p>";
}

/*********************************************
 * Show past meal plans functions
 *********************************************/
function putMealPlans() {
    // get user id
    let userId = document.getElementById("user_id").value;

    // send user id to backend
    let user = {
        "user_id": userId
    }
    sendGetRequest("get-mealplans?user_id=" + userId).then(r => {
        console.log(r);
        mealplans = r;
        // create a table for the meal plans
        let table = document.createElement("table");
        table.setAttribute("id", "mealplans_table");
        // create table header
        let header = "<tr><th>Meal Plan ID</th><th>Meal Plan Name</th><th>Start Date</th><th>End Date</th><th>Entries</th><th></th><th></th></tr>";
        for (let i = 0; i < mealplans.length; i++) {
            let mealplan = mealplans[i];
            let row = "<tr><td>" + mealplan.id + "</td><td>" + mealplan.name + "</td><td>" + mealplan.start_date + "</td><td>" + mealplan.end_date + "</td><td>";
            for (let j = 0; j < mealplan.entries.length; j++) {
                let entry = mealplan.entries[j];
                row += entry.date + " " + entry.meal + " " + entry.recipe_id + "<br>";
            }
            row += "</td><td><button onclick='copyMealPlan(" + mealplan.id + ")'>Reuse</button></td>" +
                "</td><td><button onclick='getShoppingList("+ mealplan.id + ")'>Get Shopping list</button></td></tr>";
            header += row;
        }
        table.innerHTML = header;
        document.getElementById("content_area").innerHTML = "";
        document.getElementById("content_area").appendChild(table);
        // document.getElementById("content_area").innerHTML = "<p>Past Meal Plans</p>";
    });
}

function showMealPlans() {
    clearAreas();
    document.getElementById("form_area").innerHTML = "<h1>See Meal Plans</h1>" +
        "<form>" +
        "   <label for='user_id'>User ID:</label>" +
        "   <input type='number' id='user_id' name='user_id'><br><br>" +
        "   <input type='submit' value='Submit'>" +
        "</form>";

    // add event listener to form
    document.getElementById("form_area").addEventListener("submit", function (event) {
        event.preventDefault();
        putMealPlans();
    });
}

/*********************************************
 * Show create shopping list functions
 *********************************************/
function getShoppingList(id) {
    // get shopping list from backend
    sendGetRequest("get-shopping-list?mealplan_id=" + id).then(r => {
        shopping_list = r;
        // create a table for the shopping list
        let table = document.createElement("table");
        table.setAttribute("id", "shopping_list_table");
        // create table header
        let header = "<tr><th>Ingredient</th><th>Quantity</th><th>Unit</th></tr>";
        for (let i = 0; i < shopping_list.length; i++) {
            let ingredient = shopping_list[i];
            let row = "<tr><td>" + ingredient.name + "</td><td>" + ingredient.qty + "</td><td>" + ingredient.unit + "</td></tr>";
            header += row;
        }
        table.innerHTML = header;
        document.getElementById("content_area").appendChild(table);
    });
}

function copyMealPlan(id) {
    sendGetRequest("copy-mealplan?mealplan_id=" + id).then(r => {
        console.log(r);
        // TODO display meal plan entry in content area
        showMealPlans()
    });
}