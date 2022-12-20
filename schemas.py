from pydantic import BaseModel
from pydantic.schema import datetime
from pydantic.types import date


class UserBase(BaseModel):
    username: str
    name: str
    email: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int


class IngredientBase(BaseModel):
    name: str
    qty: str
    unit: str


class IngredientCreate(IngredientBase):
    pass


class Ingredient(IngredientBase):
    id: int


class StepBase(BaseModel):
    text: str
    step_num: int


class StepCreate(StepBase):
    pass


class Step(StepBase):
    id: int
    pass


class RecipeBase(BaseModel):
    name: str
    description: str
    ingredients: list[IngredientBase]
    steps: list[StepBase]
    image_src: str


class RecipeCreate(RecipeBase):
    pass


class Recipe(RecipeBase):
    id: str


class Search(BaseModel):
    search_type: str
    search_text: str
    limit: int

class MealPlanEntryBase(BaseModel):
    recipe_id: str
    date: date
    meal: str
    mealplan_id: int

class MealPlanEntryCreate(MealPlanEntryBase):
    pass

class MealPlanEntry(MealPlanEntryBase):
    id: int

class MealPlanBase(BaseModel):
    name: str
    start_date: date
    end_date: date
    user_id: str

class MealPlanCreate(MealPlanBase):
    pass

class MealPlan(MealPlanBase):
    id: int
    entries: list[MealPlanEntry]


