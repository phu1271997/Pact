# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

class Contract(gl.Contract):
    test_storage: TreeMap[u256, str]
    owner: Address

    def __init__(self):
        self.owner = gl.message.sender_address

    @gl.public.write
    def write_test(self, key: u256, value: str) -> None:
        """
        Writes a test value to the persistent TreeMap storage.
        """
        self.test_storage[key] = value

    @gl.public.view
    def read_test(self, key: u256) -> str:
        """
        Reads a test value from the persistent TreeMap storage.
        """
        return self.test_storage.get(key, "")
