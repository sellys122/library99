"""Editable Blender courtyard scenery around the existing library cutaway."""
import bpy, math, os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
colors={'lawn':(.31,.48,.27),'paving':(.62,.62,.54),'soil':(.28,.21,.13),'wood':(.40,.25,.12),'leaf':(.19,.36,.19),'leaf_light':(.34,.49,.23),'flower':(.91,.63,.22),'metal':(.20,.26,.23),'lamp':(.96,.81,.42),'roof':(.35,.43,.45),'house':(.73,.74,.64)}
materials={}
for name,color in colors.items():
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);materials[name]=m
# Coordinates match the game's X, height Y, depth Z convention.
def pos(x,y,z):return(x,-z,y)
def box(name,p,size,material):
 bpy.ops.mesh.primitive_cube_add(size=1,location=pos(*p));o=bpy.context.object;o.name=name;o.dimensions=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(materials[material]);bevel=o.modifiers.new('soft corners','BEVEL');bevel.width=.045;bevel.segments=2;bpy.ops.object.modifier_apply(modifier=bevel.name)
def sphere(name,p,scale,material):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,location=pos(*p));o=bpy.context.object;o.name=name;o.scale=(scale[0],scale[2],scale[1]);o.data.materials.append(materials[material]);bpy.ops.object.shade_smooth()
def tree(x,z,height=2.4):
 box('tree trunk',(x,height*.40,z),(.22,height*.80,.22),'wood')
 for dx,dy,dz,size in [(-.45,.74,0,.72),(.4,.80,.15,.73),(0,1.,0,.80)]:sphere('tree crown',(x+dx,height*dy,z+dz),(size,.82,size),'leaf_light' if dx>0 else 'leaf')
# A ring of garden, leaving the playable interior free of geometry.
box('north garden',(0,-.18,-13.3),(36,.24,4.6),'lawn');box('east garden',(15.2,-.18,0),(4.5,.24,24),'lawn');box('west garden',(-15.2,-.18,0),(4.5,.24,24),'lawn');box('entrance paving',(0,-.15,12.7),(29,.20,3.6),'paving')
for x in [-14.8,14.8]:
 for z in [-10,-3,4]:tree(x,z)
for x in [-11,-5,2,8,14]:tree(x,-14.2,2.7)
for x in [-9,8]:
 box('courtyard bench seat',(x,.42,12.6),(2.3,.12,.60),'wood');box('bench back',(x,.78,12.93),(2.3,.65,.11),'wood')
 for dx in [-.85,.85]:box('bench leg',(x+dx,.20,12.6),(.13,.40,.48),'metal')
for x in [-12.5,12.5]:
 box('street lamp pole',(x,1.2,12.3),(.10,2.4,.10),'metal');sphere('street lamp globe',(x,2.47,12.3),(.24,.28,.24),'lamp')
for x in [-14.5,14.5]:
 for z in [-7,1,8]:
  box('flower bed',(x,.02,z),(1.5,.2,1.5),'soil')
  for dx,dz in [(-.35,-.3),(.25,.15),(-.3,.35),(.3,-.3)]:sphere('golden flowers',(x+dx,.25,z+dz),(.13,.13,.13),'flower')
for x in [-11,0,11]:
 box('distant neighborhood',(x,1.2,-18.3),(4,2.4,2),'house');box('distant roof',(x,2.5,-18.3),(4.3,.25,2.3),'roof')
bpy.ops.object.select_all(action='SELECT');bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'dist','assets','exterior.glb'),export_format='GLB',use_selection=True,export_apply=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'models','exterior.blend'))
print('EXTERIOR_READY')
