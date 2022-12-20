import mysql.connector

from schemas import Recipe, Ingredient, Step, MealPlan, MealPlanEntry

MYSQL_DATABASE_URL = "mysql+mysqlconnector://root:21304@127.0.0.1:3306/mealplan"


# connect to the database
class db:
    def __init__(self):
        self.conn = mysql.connector.connect(user='root',
                                            password='21304',
                                            host='127.0.0.1',
                                            database='mealplan')
        self.cursor = self.conn.cursor()
        # cursor.execute html escapes tuples, preventing sql injection

    # drop all tables
    def drop_all(self):
        # drop all tables
        self.cursor.execute("DROP TABLE IF EXISTS meal_plan_entries")
        self.cursor.execute("DROP TABLE IF EXISTS meal_plans")
        self.cursor.execute("DROP TABLE IF EXISTS saved_recipes")
        self.cursor.execute("DROP TABLE IF EXISTS steps")
        self.cursor.execute("DROP TABLE IF EXISTS ingredients")
        self.cursor.execute("DROP TABLE IF EXISTS recipes")
        self.cursor.execute("DROP TABLE IF EXISTS users")
        self.conn.commit()

    # create user table
    def create_user_table(self):
        self.cursor.execute("CREATE TABLE users "
                            "(id INT AUTO_INCREMENT PRIMARY KEY, "
                            "username VARCHAR(255) NOT NULL UNIQUE, "
                            "name VARCHAR(255) NOT NULL, "
                            "email VARCHAR(255) NOT NULL UNIQUE)")
        self.conn.commit()

    # create recipe table
    def create_recipes_table(self):
        self.cursor.execute("CREATE TABLE recipes "
                            "(id VARCHAR(12) PRIMARY KEY, "
                            "name VARCHAR(255) NOT NULL, "
                            "description MEDIUMTEXT, "
                            "image_src VARCHAR(255)) ")
        self.conn.commit()

    # ingredients table
    def create_ingredients_table(self):
        self.cursor.execute("CREATE TABLE ingredients "
                            "(id INT AUTO_INCREMENT PRIMARY KEY, "
                            "name VARCHAR(255) NOT NULL, "
                            "qty varchar(255), "
                            "unit VARCHAR(255), "
                            "recipe_id VARCHAR(12), "
                            "FOREIGN KEY (recipe_id) REFERENCES recipes(id))")
        self.conn.commit()

    # steps table
    def create_steps_table(self):
        self.cursor.execute("CREATE TABLE steps "
                            "(id INT AUTO_INCREMENT PRIMARY KEY, "
                            "text MEDIUMTEXT, "
                            "step_num INT, "
                            "recipe_id VARCHAR(12), "
                            "FOREIGN KEY (recipe_id) REFERENCES recipes(id))")
        self.conn.commit()

    # saved recipes table
    def create_saved_recipes_table(self):
        self.cursor.execute("CREATE TABLE saved_recipes "
                            "(id INT AUTO_INCREMENT PRIMARY KEY, "
                            "user_id INT, "
                            "recipe_id VARCHAR(12), "
                            "FOREIGN KEY (user_id) REFERENCES users(id), "
                            "FOREIGN KEY (recipe_id) REFERENCES recipes(id))")
        self.conn.commit()

    # meal plans table
    def create_meal_plans_table(self):
        self.cursor.execute("CREATE TABLE meal_plans "
                            "(id INT AUTO_INCREMENT PRIMARY KEY, "
                            "name VARCHAR(255) NOT NULL, "
                            "user_id INT, "
                            "start_date DATE, "
                            "end_date DATE, "
                            "FOREIGN KEY (user_id) REFERENCES users(id))")
        self.conn.commit()

    # create meal plan entries table
    def create_meal_plan_entry_table(self):
        self.cursor.execute("CREATE TABLE meal_plan_entries "
                            "(id INT AUTO_INCREMENT PRIMARY KEY, "
                            "mealplan_id INT, "
                            "recipe_id VARCHAR(12), "
                            "date DATE, "
                            "meal VARCHAR(9), " # breakfast, lunch, dinner, snack
                            "FOREIGN KEY (mealplan_id) REFERENCES meal_plans(id), "
                            "FOREIGN KEY (recipe_id) REFERENCES recipes(id))")
        self.conn.commit()

    # create a new user
    def create_user(self, name, username, email):
        self.cursor.execute("INSERT INTO users "
                            "(name, username, email) "
                            "VALUES (%s, %s, %s)",
                            (name, username, email))
        self.conn.commit()
        id = self.get_user_by_username(username)[0]
        return {"user_id": id}


    # get a user by username
    def get_user_by_username(self, username):
        self.cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = self.cursor.fetchone()
        return user

    # get all users
    def get_all_users(self):
        self.cursor.execute("SELECT * FROM users")
        users = self.cursor.fetchall()
        return users

    # create a new recipe
    def create_recipe(self, id, name, description, image_src):
        # check if recipe already exists
        self.cursor.execute("SELECT * FROM recipes WHERE id = %s", (id,))
        recipe = self.cursor.fetchone()
        if recipe is None:
            self.cursor.execute("INSERT INTO recipes "
                                "(id, name, description, image_src) "
                                "VALUES (%s, %s, %s, %s)", (id, name, description, image_src))
            self.conn.commit()
            return True
        else:
            return False

    # create recipe ingredients
    def create_ingredient(self, name, qty, unit, recipe_id):
        self.cursor.execute("INSERT INTO ingredients "
                            "(name, qty, unit, recipe_id) "
                            "VALUES (%s, %s, %s, %s)", (name, qty, unit, recipe_id))
        self.conn.commit()

    def create_step(self, text, step_num, recipe_id):
        self.cursor.execute("INSERT INTO steps "
                            "(text, step_num, recipe_id) "
                            "VALUES (%s, %s, %s)", (text, step_num, recipe_id))
        self.conn.commit()

    # get all recipes
    def get_many_recipes(self):
        self.cursor.execute("SELECT id FROM recipes")
        recipe_list = self.cursor.fetchall()
        all_recipes = []
        for row_tuple in recipe_list:
            recipe = self.get_recipe_by_id(row_tuple[0])
            all_recipes.append(recipe)
        return all_recipes

    # get a recipe by id
    def get_recipe_by_id(self, id):
        self.cursor.execute("SELECT * FROM recipes WHERE id = %s", (id,))
        recipe = self.cursor.fetchone()
        # create a recipe object
        if recipe is not None:
            # get ingredients
            self.cursor.execute("SELECT * FROM ingredients WHERE recipe_id = %s", (id,))
            ingredients_tuple = self.cursor.fetchall()
            ingredients = []
            for ingredient in ingredients_tuple:
                ingredients.append(
                    Ingredient(id=ingredient[0], name=ingredient[1], qty=ingredient[2], unit=ingredient[3]))
            # get steps
            self.cursor.execute("SELECT * FROM steps WHERE recipe_id = %s", (id,))
            steps_tuple = self.cursor.fetchall()
            steps = []
            for step in steps_tuple:
                steps.append(Step(id=step[0], text=step[1], step_num=step[2]))
            # create the recipe object
            recipe = Recipe(id=id, name=recipe[1], description=recipe[2], image_src=recipe[3], ingredients=ingredients,
                            steps=steps)
            return recipe
        else:
            return {"message": "Recipe not found"}

    # search for recipes
    def search_recipes(self, search_field, search_txt, limit):
        if search_field == "name":
            # TODO: refactor this to be able to search for multiple names
            self.cursor.execute("SELECT id FROM recipes WHERE name LIKE %s LIMIT %s", (search_txt, limit))
        elif search_field == "ingredients":
            # TODO: refactor this to be able to search ingredients that are not exact matches
            ingredients = search_txt.split(", ")
            # for each ingredient in the list, get the recipe ids and then inner join them
            query = "SELECT recipe_id FROM ingredients WHERE name LIKE %s"
            for i in range(1, ingredients.__len__()):
                query += " INTERSECT SELECT recipe_id FROM ingredients WHERE name LIKE %s"
            query += " LIMIT %s"
            # create a tuple of the ingredients and the limit
            ingredients.append(limit)
            query_tuple = tuple(ingredients)
            self.cursor.execute(query, query_tuple)
        else:
            return {"message": "Invalid search field"}
        # get the recipe ids using the queries previously made
        found_recipes = self.cursor.fetchall()
        # check if no recipes were found
        if found_recipes.__len__() == 0:
            return {"message": "No recipes found"}
        else:
            recipes = []
            for recipe in found_recipes:
                recipes.append(self.get_recipe_by_id(recipe[0]))
            return recipes

    # save a recipe for a user
    def save_recipe(self, user_id, mealplan_id):
        self.cursor.execute("INSERT INTO saved_recipes "
                            "(user_id, recipe_id) "
                            "VALUES (%s, %s)", (user_id, mealplan_id))
        self.conn.commit()
        return {"message": "Recipe saved"}

    def add_to_meal_plan(self, recipe_id, meal, mealplan_id, date):
        self.cursor.execute("INSERT INTO meal_plan_entries "
                            "(recipe_id, meal, mealplan_id, date) "
                            "VALUES (%s, %s, %s, %s)", (recipe_id, meal, mealplan_id, date))
        self.conn.commit()
        return {"message": "Recipe added to meal plan"}

    def create_new_meal_plan(self, name, start_date, end_date, user_id):
        self.cursor.execute("INSERT INTO meal_plans "
                            "(name, start_date, end_date, user_id) "
                            "VALUES (%s, %s, %s, %s)", (name, start_date, end_date, user_id))
        self.conn.commit()
        return {"message": "Meal plan created"}

    def get_shopping_list(self, mealplan_id):
        self.cursor.execute("SELECT * FROM meal_plan_entries WHERE mealplan_id = %s", (mealplan_id,))
        meal_plan_entries = self.cursor.fetchall()
        shopping_list = []
        for entry in meal_plan_entries:
            recipe = self.get_recipe_by_id(entry[2])
            for ingredient in recipe.ingredients:
                shopping_list.append(ingredient)
        return shopping_list

    def get_mealplans(self, user_id):
        self.cursor.execute("SELECT * FROM meal_plans WHERE user_id = %s", (user_id,))
        mealplans = self.cursor.fetchall()

        # create a list of mealplan objects
        mealplan_list = []

        for mealplan in mealplans:
            id = mealplan[0]
            name = mealplan[1]
            start_date = str(mealplan[3])
            end_date = str(mealplan[4])
            user_id = mealplan[2]
            # get the meal plan entries
            self.cursor.execute("SELECT * FROM meal_plan_entries WHERE mealplan_id = %s", (id,))
            meal_plan_entries = self.cursor.fetchall()

            # create a list of meal plan entry objects
            meal_plan_entry_list = []
            for entry in meal_plan_entries:
                entry_id = entry[0]
                mealplan_id = entry[1]
                recipe_id = entry[2]
                date = str(entry[3])
                meal = entry[4]
                meal_plan_entry_list.append(MealPlanEntry(id=entry_id, mealplan_id=mealplan_id, recipe_id=recipe_id, date=date, meal=meal))

            # create the meal plan object
            mealplan_list.append(MealPlan(id=id, name=name, start_date=start_date, end_date=end_date, user_id=user_id, entries=meal_plan_entry_list))
        return mealplan_list

    def copy_mealplan(self, mealplan_id):
        # get the meal plan
        self.cursor.execute("SELECT * FROM meal_plans WHERE id = %s", (mealplan_id,))
        mealplan = self.cursor.fetchone()
        # create a new meal plan with the same name
        self.cursor.execute("INSERT INTO meal_plans "
                            "(name, start_date, end_date, user_id) "
                            "VALUES (%s, %s, %s, %s)", (mealplan[1]+"(copy)", mealplan[3], mealplan[4], mealplan[2]))
        self.conn.commit()
        # get the new meal plan id
        self.cursor.execute("SELECT id FROM meal_plans WHERE name = %s", (mealplan[1]+"(copy)",))
        new_mealplan_id = self.cursor.fetchone()[0]
        # get the meal plan entries
        self.cursor.execute("SELECT * FROM meal_plan_entries WHERE mealplan_id = %s", (mealplan_id,))
        meal_plan_entries = self.cursor.fetchall()
        # copy the meal plan entries
        for entry in meal_plan_entries:
            self.cursor.execute("INSERT INTO meal_plan_entries "
                                "(recipe_id, meal, mealplan_id, date) "
                                "VALUES (%s, %s, %s, %s)", (entry[2], entry[4], new_mealplan_id, entry[3]))
            self.conn.commit()
        return {"message": "Meal plan copied"}