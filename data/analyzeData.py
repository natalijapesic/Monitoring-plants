import json

f = open('database.json')

data = json.load(f)

# Example of json object:

# "Tsoil": 4.818,
# "Tair": 4.61,
# "RHpercent": 97.9,
# "VWC_m3_per_m3_interhummock": 0.1034,
# "VWC_m3_per_m3_hummock": 0.1223


min_tsoil = data[0]["Tsoil"]
min_tair = data[0]["Tair"]
min_rhp = data[0]["RHpercent"]
min_hummock = data[0]["VWC_m3_per_m3_hummock"]

max_tsoil = data[0]["Tsoil"]
max_tair = data[0]["Tair"]
max_rhp = data[0]["RHpercent"]
max_hummock = data[0]["VWC_m3_per_m3_hummock"]

avg_tsoil = 0
avg_tair = 0
avg_rhp = 0
avg_hummock = 0

for i in data:
    avg_tsoil += i["Tsoil"]
    if min_tsoil > i["Tsoil"]:
        min_tsoil = i["Tsoil"] 
    
    if max_tsoil < i["Tsoil"]:
        max_tsoil = i["Tsoil"] 
    
    avg_tair += i["Tair"]
    if min_tair > i["Tair"]:
        min_tair = i["Tair"] 
        
    if max_tair < i["Tair"]:
        max_tair = i["Tair"] 
    
    avg_rhp += i["RHpercent"]
    if min_rhp > i["RHpercent"]:
        min_rhp = i["RHpercent"]
       
    if max_rhp < i["RHpercent"]:
        max_rhp = i["RHpercent"] 

    avg_hummock += i["VWC_m3_per_m3_hummock"]
    if min_hummock > i["VWC_m3_per_m3_hummock"]:
        min_hummock = i["VWC_m3_per_m3_hummock"]
       
    if max_hummock < i["VWC_m3_per_m3_hummock"]:
        max_hummock = i["VWC_m3_per_m3_hummock"] 

avg_tsoil /= len(data)
avg_tair /= len(data)
avg_rhp /= len(data)
avg_hummock /= len(data)

print("max_tsoil: " + str(max_tsoil))
print("max_tair: " + str(max_tair))
print("max_rhp: " + str(max_rhp))
print("max_hummock: " + str(max_hummock))

print("min_tsoil: " + str(min_tsoil))
print("min_tair: " + str(min_tair))
print("min_rhp: " + str(min_rhp))
print("min_hummock: " + str(min_hummock))

print("avg_tsoil: " + str(avg_tsoil))
print("avg_tair: " + str(avg_tair))
print("avg_rhp: " + str(avg_rhp))
print("avg_hummock: " + str(avg_hummock))

f.close()


