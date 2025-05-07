

class UserAlreadyExistsException(Exception):

    def __init__(self):
        self.message = "User already exists"
        super().__init__((self.message))


class InvalidCredentialException(Exception):

    def __init__(self, message="Invalid Credential. Please enter valid username and password."):
        self.message = message
        super().__init__((self.message))              