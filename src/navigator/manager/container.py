from dependency_injector import containers, providers
from manager.storage import Storage
from manager.command import Command

class Container(containers.DeclarativeContainer):

    storage = providers.Factory(Storage)
    command = providers.Factory(Command, storage)
