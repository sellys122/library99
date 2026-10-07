"""Blender 4.3: separate desk phone, self-check kiosk and wall notices."""
import bpy, math, os, json
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); ASSETS=os.path.join(ROOT,'dist','assets')
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
colors={'sage':(.30,.49,.40),'cream':(.94,.88,.72),'dark':(.12,.20,.19),'mint':(.57,.73,.59),'screen':(.36,.68,.65),'gold':(.85,.64,.29),'paper':(.96,.92,.79),'coral':(.78,.36,.29),'oak':(.58,.36,.20)}
M={}
for key,color in colors.items():
 m=bpy.data.materials.new(key);m.diffuse_color=(*color,1);m.use_nodes=True;m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(*color,1);M[key]=m
groups={};current='phone'
def pos(x,y,z):return(x,-z,y)
def add(o,name,color):o.name=name;o.data.materials.append(M[color]);groups.setdefault(current,[]).append(o);return o
def box(name,p,size,color,bevel=.02):
 bpy.ops.mesh.primitive_cube_add(size=1,location=pos(*p));o=bpy.context.object;o.dimensions=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bevel:
  mod=o.modifiers.new('rounded edges','BEVEL');mod.width=bevel;mod.segments=2;bpy.ops.object.modifier_apply(modifier=mod.name)
 return add(o,name,color)
def text(body,p,size,color):
 bpy.ops.object.text_add(location=pos(*p),rotation=(math.pi/2,0,0));o=bpy.context.object;o.data.body=body;o.data.align_x='CENTER';o.data.size=size;o.data.extrude=.001;bpy.ops.object.convert(target='MESH');return add(bpy.context.object,'Label_'+body,color)
box('Desk telephone base',(0,.065,0),(.57,.13,.40),'sage',.035)
box('Telephone display',(0,.14,-.065),(.25,.026,.08),'screen',.008)
for row in range(4):
 for col in range(3):box('Telephone key',(-.09+col*.09,.144,.035+row*.053),(.045,.014,.033),'cream',.004)
box('Handset left',(-.25,.18,0),(.11,.08,.32),'dark',.035)
box('Handset bridge',(-.25,.19,0),(.085,.07,.15),'dark',.02)
for i in range(14):box('Telephone coil',(-.33,.12,.12+i*.014),(.035,.028,.015),'dark',.006)
current='kiosk'
box('Self check base',(0,.12,0),(1.2,.24,1.0),'sage',.05)
box('Self check cabinet',(0,.82,0),(1.06,1.42,.86),'cream',.08)
box('Screen surround',(0,1.27,.445),(.83,.70,.035),'sage',.025)
box('Touch screen',(0,1.32,.473),(.67,.43,.018),'screen',.018)
text('LOAN / RETURN',(0,1.37,.49),.075,'paper')
text('SCAN YOUR CARD',(0,1.23,.49),.060,'paper')
box('Scanner shelf',(0,.79,.61),(1.03,.08,.46),'sage',.025)
box('Card reader',(-.27,.87,.62),(.25,.07,.21),'dark',.015)
box('Book scanner',(.24,.86,.62),(.39,.045,.30),'dark',.015)
box('Scanner glass',(.24,.89,.62),(.31,.018,.24),'screen',.005)
text('SELF CHECK',(0,.40,.441),.12,'sage')
box('Status lamp',(.38,1.70,.31),(.055,.055,.055),'gold',.01)
current='board'
box('Wall notice frame',(0,0,0),(2.6,1.9,.15),'oak',.04)
box('Cork board',(0,0,.09),(2.42,1.72,.025),'gold',.008)
box('Hours poster',(-.61,.10,.12),(1.04,1.35,.025),'paper',.007)
text('LIBRARY HOURS',(-.61,.63,.14),.09,'sage')
text('09:00 - 18:00',(-.61,.34,.14),.12,'dark')
text('CLOSED MONDAY',(-.61,.12,.14),.08,'coral')
for i,label in enumerate(['KNITTING CLUB','BOOK TRAVEL','KIDS BOOK TOUR']):
 y=.54-i*.53;box('Event notice',(.62,y,.12),(1.04,.46,.025),'mint' if i%2 else 'cream',.008);text(label,(.62,y+.08,.145),.065,'sage');text(['OCT 10 | 12 PEOPLE','OCT 14 | 20 PEOPLE','OCT 17 | 15 PEOPLE'][i],(.62,y-.06,.145),.052,'dark')
for x,y in [(-1.0,.78),(.15,.78),(1.0,.78),(.15,.20),(1.0,.20),(.15,-.30),(1.0,-.30)]:box('Poster pin',(x,y,.165),(.035,.035,.025),'coral',.01)
for name,objects in groups.items():
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();o=bpy.context.object;o.name=name
 bpy.context.scene.cursor.location=(0,0,0);bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
 bpy.ops.export_scene.gltf(filepath=os.path.join(ASSETS,name+'.glb'),export_format='GLB',use_selection=True,export_apply=True)
 o.location=pos({'phone':-7.5,'kiosk':9.8,'board':-12.7}[name],{'phone':1.29,'kiosk':0,'board':1.9}[name],{'phone':7.7,'kiosk':6.7,'board':3.5}[name])
 if name=='board':o.rotation_euler[2]=math.pi/2
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'models','service-devices.blend'))
path=os.path.join(ASSETS,'layout.json')
with open(path) as f:layout=json.load(f)
layout.update({'phone':{'x':-7.5,'z':7.7},'kiosk':{'x':9.8,'z':6.7},'board':{'x':-12.7,'z':3.5}})
layout['colliders']=[c for c in layout['colliders'] if c['id']!='kiosk']+[{'id':'kiosk','x':9.8,'z':6.7,'w':1.2,'d':1.0}]
with open(path,'w') as f:json.dump(layout,f,ensure_ascii=False,indent=2)
print('PHONE_KIOSK_BOARD_READY')
