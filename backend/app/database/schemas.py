def individual_data(user):
    return {
        "id" : str(user["_id"]),
        "tele_handle" : user["tele_handle"],
        "code" : user["code"],
        "authenticated" : user["authenticated"],
        "created" : user["created"]
    }

def all_data(users):
    return [individual_data(user) for user in users]