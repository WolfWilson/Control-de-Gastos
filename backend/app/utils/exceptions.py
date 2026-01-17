class ExpenseNotFoundError(Exception):
    """Raised when expense is not found"""
    pass


class CategoryNotFoundError(Exception):
    """Raised when category is not found"""
    pass


class InvalidAmountError(Exception):
    """Raised when amount is invalid"""
    pass


class DuplicateCategoryError(Exception):
    """Raised when trying to create a category with existing name"""
    pass
