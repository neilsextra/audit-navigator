from urllib.parse import urlparse

class Command:
    
    CONFIGURATION_ROW = "$"

    def __init__(self, storage) -> None:
        """
        Instantiate the object - called from the 'container' 

        Parameters
        ----------
        self : object
            The 'self' owner object
        storage : object
              The interface between the application and the data-lake
        """
        self.storage = storage
    
    def set_logger(self, logger):
        """
        Set the logger called from FLASK
 
        Parameters
        ----------
        self : object
            The 'self' owner object
        logger : object
              The FLASK logger
        """
        self.logger = logger
        self.storage.set_logger(logger)
 
    def status(self, parameters):
        """
        Instantiate the object - called from the 'container' 

        Parameters
        ----------
        self : object
            The 'self' owner object
        parameters : object
              An array of name/value parameters
        """
  
        config, status_code = self.storage.get_row(parameters["datalake_url"],  
                                                parameters["datalake_userid"], 
                                                parameters["datalake_password"], 
                                                parameters["datalake_namespace"], 
                                                parameters["datalake_table"],
                                                Command.CONFIGURATION_ROW)  

        return config, status_code  
         
    def search(self, parameters):
        """
        Search the datalake primary table or the associated indexes 

        Parameters
        ----------
        self : object
            The 'self' owner object
        parameters : object
              An array of name/value parameters
        """

        filter = "*" if parameters['row_filter'] == "" else parameters['row_filter']
        table =  parameters["datalake_table"] if len(parameters['search_index']) == 0 else parameters['search_index']

        rows, status_code = self.storage.search_table(parameters["datalake_url"],  
                                              parameters["datalake_userid"], 
                                              parameters["datalake_password"], 
                                              parameters["datalake_namespace"], 
                                              table,
                                              filter,
                                              parameters["row_limit"],
                                              parameters["column_offset"],
                                              parameters["column_length"]
                                              )   
        return rows, status_code
