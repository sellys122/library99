"""Build the adjacent catalogue terminal and render the original librarian in defeat."""
import bpy, os, json, math
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));ASSETS=os.path.join(ROOT,'dist','assets')
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
materials={}
for name,color in {'sage':(.30,.49,.40),'cream':(.94,.88,.72),'dark':(.12,.20,.19),'screen':(.36,.68,.65),'paper':(.96,.92,.79)}.items():
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True;m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(*color,1);materials[name]=m
def box(name,p,size,material):
 bpy.ops.mesh.primitive_cube_add(size=1,location=(p[0],-p[2],p[1]));o=bpy.context.object;o.name=name;o.dimensions=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(materials[material]);mod=o.modifiers.new('rounded edges','BEVEL');mod.width=.025;mod.segments=2;bpy.ops.object.modifier_apply(modifier=mod.name)
def label(body,p,size):
 bpy.ops.object.text_add(location=(p[0],-p[2],p[1]),rotation=(math.pi/2,0,0));o=bpy.context.object;o.data.body=body;o.data.align_x='CENTER';o.data.size=size;o.data.extrude=.001;o.data.materials.append(materials['paper']);bpy.ops.object.convert(target='MESH')
box('Catalogue terminal cabinet',(0,.68,0),(1.08,1.36,.85),'sage')
box('Search screen frame',(0,1.43,.1),(1.12,.67,.20),'cream')
box('Search display',(0,1.43,.21),(.92,.48,.025),'screen')
label('BOOK SEARCH',(0,1.43,.23),.09)
box('Keyboard ledge',(0,1.02,.43),(1.14,.10,.49),'cream')
box('Keyboard',(0,1.10,.43),(.64,.04,.25),'dark')
box('Print slot',(0,.75,.443),(.63,.06,.015),'dark')
box('Paper drawer',(0,.42,.443),(.83,.29,.02),'cream')
label('CATALOGUE',(0,.17,.44),.10)
bpy.ops.object.select_all(action='SELECT');bpy.context.view_layer.objects.active=next(o for o in bpy.context.scene.objects if o.type=='MESH');bpy.ops.object.join();o=bpy.context.object;o.name='search';bpy.context.scene.cursor.location=(0,0,0);bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
bpy.ops.export_scene.gltf(filepath=os.path.join(ASSETS,'search.glb'),export_format='GLB',use_selection=True,export_apply=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'models','search-terminal.blend'))
path=os.path.join(ASSETS,'layout.json');layout=json.load(open(path));layout['search']={'x':10.65,'z':3.6};layout['colliders']=[c for c in layout['colliders'] if c['id']!='search']+[{'id':'search','x':10.65,'z':3.6,'w':1.14,'d':.98}];json.dump(layout,open(path,'w'),ensure_ascii=False,indent=2)
bpy.ops.wm.open_mainfile(filepath=os.path.join(ROOT,'models','library.blend'))
root=bpy.data.objects.get('librarian_root');root.location=(0,0,0)
keep={root,*root.children_recursive}
for obj in bpy.context.scene.objects:
 if obj.type=='MESH' and obj not in keep:obj.hide_render=True
for child in root.children:
 if child.name=='librarian':child.rotation_euler[0]=.27
 if child.name.startswith('arm.'):child.rotation_euler[0]=-2.40;child.rotation_euler[1]=-.65 if child.name.endswith('L') else .65;child.location.y-=.18
for obj in list(bpy.context.scene.objects):
 if obj.type in ['LIGHT','CAMERA']:bpy.data.objects.remove(obj,do_unlink=True)
bpy.ops.object.light_add(type='AREA',location=(2,-3,5));bpy.context.object.data.energy=400;bpy.context.object.data.size=4
bpy.ops.object.light_add(type='AREA',location=(-2,1,3));bpy.context.object.data.energy=160;bpy.context.object.data.size=3
bpy.ops.object.camera_add(location=(2.8,-4.5,2.3));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,.8))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=2.5
s=bpy.context.scene;s.camera=cam;s.render.engine='CYCLES';s.cycles.samples=32;s.cycles.use_denoising=False;s.render.film_transparent=True;s.render.resolution_x=640;s.render.resolution_y=640;s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA';s.render.filepath=os.path.join(ASSETS,'fired.png');bpy.ops.render.render(write_still=True)
print('SEARCH_MODEL_AND_FIRED_IMAGE_READY')
