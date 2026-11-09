import base64
import requests
import urllib3

class Storage:

    @staticmethod
    def b64_encode(s: str) -> str:
        """Helper to encode a string to Base64 (required by HBase JSON)."""
        return base64.b64encode(s.encode("utf-8")).decode("utf-8")

    @staticmethod
    def b64_decode(s: str) -> str:
        """Helper to decode a Base64 string back to standard text."""
        return base64.b64decode(s.encode("utf-8")).decode("utf-8")

    def __init__(self) -> None:
        None

    def set_logger(self, logger):
         self.logger = logger

    def table_exists(self, base_url:str, name_space:str, userid:str, password:str, table_name:str):
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        
        headers = {"Content-Type": "application/json", "Accept": "application/json"}

        # Define the table metadata structure
        full_table_name = f"{name_space}:{table_name}"
        url = f"{base_url}/{full_table_name}/exists"    

        self.logger.info(f"[table_exists] URL: {url} - {userid}/{password}")
        
        response = requests.get(url, headers=headers, auth=(userid, password), verify=False)

        self.logger.info(f"response: {response.status_code}")

        return int(response.status_code) in [200, 201]

    def get_row(self, base_url:str, userid:str, password:str, name_space:str, table_name:str, row_key: str):
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        
        values = []

        url = f"{base_url}/{name_space}:{table_name}/{row_key}"

        print(f"(get_row) {url}")
        headers = {"Accept": "application/json"}

        response = requests.get(url, auth=(userid, password), headers=headers, verify=False)
        
        if response.status_code == 200:
            data = response.json()
            for row in data.get("Row", []):
                for cell in row.get("Cell", []):
                    # Decode column name and cell value
                    col = Storage.b64_decode(cell.get("column"))
                    val = Storage.b64_decode(cell.get("$"))

                    values.append({
                        "row": row_key,
                        "col": col,
                        "val": val
                    })
                    
        else:
            return [], response.status_code

        return values, 200

    def get_clob(self, base_url:str, userid:str, password:str, name_space:str, table_name:str, 
                        filter: str ="*", limit: str = "10", offset: str = "0", length: str = "2"):
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

        rows = []

        url = f"{base_url}/{name_space}:{table_name}/{filter}?limit={limit}&filter=ColumnPaginationFilter({length},{offset})"

        print(f"(get_clob) {url}")
        headers = {"Accept": "application/json"}

        response = requests.get(url, auth=(userid, password), headers=headers, verify=False)

        if response.status_code == 200:
            data = response.json()
            for row in data.get("Row", []):
                key = Storage.b64_decode(row.get("key"))
                
                cells = []
                for cell in row.get("Cell", []):
     
                    cells.append(
                        {"col": Storage.b64_decode(cell.get("column")),
                         "val": Storage.b64_decode(cell.get("$"))
                        })
    
                rows.append({
                    "key": key,
                    "cells": cells
                })

        else:
            return [], response.status_code
                                
        return rows, 200
