import json
import time
from urllib.parse import urlparse

class Command:
    
    CONFIGURATION_ROW = "$"

    def __init__(self, storage) -> None:

        self.storage = storage
    
    def set_logger(self, logger):
        self.logger = logger
        self.storage.set_logger(logger)
 
    def status(self, parameters):

        config, status_code = self.storage.get_row(parameters["datalake_url"],  
                                                parameters["datalake_userid"], 
                                                parameters["datalake_password"], 
                                                parameters["datalake_namespace"], 
                                                parameters["datalake_table"],
                                                Command.CONFIGURATION_ROW)  

        return config, status_code  
         
    def search(self, parameters):
        rows, status_code = self.storage.get_clob(parameters["datalake_url"],  
                                              parameters["datalake_userid"], 
                                              parameters["datalake_password"], 
                                              parameters["datalake_namespace"], 
                                              parameters["datalake_table"],
                                              parameters["row_filter"],
                                              parameters["row_limit"],
                                              )   

    def retrieve(self, parameters):

        return 200            
