

class UserAlreadyExistsException(Exception):

    def __init__(self, message):
        self.message = message
        super().__init__((self.message))


class InvalidCredentialException(Exception):

    def __init__(self, message):
        self.message = message
        super().__init__((self.message))   


class BookingDetailsNotFoundException(Exception):

    def __init__(self, message):
        self.message = message
        super().__init__((self.message))  


class InvalidFilterException(Exception):
    
    def __init__(self, filter_value: str, allowed_filters: list):
        allowed = ", ".join(allowed_filters)
        super().__init__(f"Invalid filter '{filter_value}'. Allowed filters: {allowed}")
