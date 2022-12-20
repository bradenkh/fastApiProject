import hashlib

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import database
from schemas import UserCreate, RecipeCreate, Search, MealPlanCreate, MealPlanEntryCreate

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = database.db()


@app.get("/")
async def root():
    return {'hello'}


@app.post("/recreate-tables")
async def create_user_table():
    db.drop_all()
    db.create_user_table()
    db.create_recipes_table()
    db.create_ingredients_table()
    db.create_steps_table()
    db.create_saved_recipes_table()
    db.create_meal_plans_table()
    db.create_meal_plan_entry_table()
    return {'created'}

@app.post("/create-user")
async def create_user(user: UserCreate):
    return db.create_user(user.name, user.username, user.email)


# create a new recipe
@app.post("/create-recipe")
async def create_recipe(r: RecipeCreate):
    hash_str = r.name + r.description
    # create a 12 digit hash for the recipe
    recipe_id = hashlib.sha256(hash_str.encode()).hexdigest()[:12]
    # create a recipe
    recipe_created = db.create_recipe(recipe_id, r.name, r.description, r.image_src)
    if recipe_created:
        # create ingredients
        for ingredient in r.ingredients:
            db.create_ingredient(ingredient.name, ingredient.qty, ingredient.unit, recipe_id)
        # create steps
        count = 1
        for step in r.steps:
            db.create_step(step.text, step.step_num, recipe_id)
            count += 1
        return {'message': "Recipe created, id: " + recipe_id}
    else:
        return {'message': 'Recipe already exists.'}


# get a recipe by id
@app.get("/get-recipe")
async def get_recipe(id: str):
    return db.get_recipe_by_id(id)


@app.get("/all-recipes")
async def get_all_recipes():
    return db.get_many_recipes()


@app.post("/search-recipes")
async def search_recipes(search: Search):
    return db.search_recipes(search.search_type, search.search_text, search.limit)


@app.post("/create-user")
async def create_user(user: UserCreate):
    return db.create_user(user.name, user.username, user.email)

@app.get("/get-mealplans")
async def get_mealplans(user_id: str):
    return db.get_mealplans(user_id)


@app.get("/get-shopping-list")
async def get_shopping_list(mealplan_id: str):
    return db.get_shopping_list(mealplan_id)


@app.post("/save-recipe")
async def save_recipe(user_id: str, mealplan_id: str):
    return db.save_recipe(user_id, mealplan_id)


@app.post("/create-meal-plan")
async def create_meal_plan(mealplan: MealPlanCreate):
    return db.create_new_meal_plan(mealplan.name, mealplan.start_date, mealplan.end_date, mealplan.user_id)


@app.post("/add-to-meal-plan")
async def add_to_meal_plan(entry: MealPlanEntryCreate):
    return db.add_to_meal_plan(entry.recipe_id, entry.meal, entry.mealplan_id, entry.date)

@app.get("/copy-mealplan")
async def copy_mealplan(mealplan_id: str):
    return db.copy_mealplan(mealplan_id)

