"""Original Blender assets for Five Days at the Library. Run with Blender 4.3+."""
import bpy, math, random, json, os
from mathutils import Vector
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, 'dist', 'assets')
os.makedirs(ASSETS, exist_ok=True)
random.seed(122)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
def mat(name, color, rough=0.8):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(*color,1)
    m.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value=rough
    return m
M={k:mat(k,c) for k,c in {
 'oak':(.58,.36,.20),'oak_light':(.79,.58,.36),'oak_dark':(.30,.18,.11),
 'cream':(.94,.88,.72),'wall':(.82,.87,.77),'sage':(.30,.49,.40),
 'mint':(.57,.73,.59),'dark':(.12,.20,.19),'gold':(.85,.64,.29),
 'coral':(.78,.36,.29),'blue':(.30,.48,.61),'yellow':(.93,.73,.34),
 'paper':(.93,.90,.81),'rose':(.73,.49,.52),'skin':(.96,.74,.56),
 'hair':(.23,.13,.095),'apron':(.23,.43,.35),'shirt':(.95,.89,.74),
 'shoes':(.22,.20,.18),'screen':(.36,.68,.65),'glass':(.60,.80,.84),
 'leaf':(.21,.43,.29),'leaf_light':(.43,.60,.31),'rug':(.66,.46,.30),
}.items()}
groups={}; current='library'
def pos(x,y,z): return (x,-z,y)
def add(o,name,material):
    o.name=name; o.data.materials.append(M[material]); groups.setdefault(current,[]).append(o); return o
def box(name,p,size,material,bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos(*p)); o=bpy.context.object
    o.dimensions=(size[0],size[2],size[1]); bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        m=o.modifiers.new('soft edges','BEVEL'); m.width=bevel; m.segments=2
        bpy.context.view_layer.objects.active=o; bpy.ops.object.modifier_apply(modifier=m.name)
        o.modifiers.new('weighted normals','WEIGHTED_NORMAL')
    return add(o,name,material)
def ball(name,p,size,material):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,location=pos(*p)); o=bpy.context.object
    o.scale=(size[0],size[2],size[1]); bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    for f in o.data.polygons: f.use_smooth=True
    return add(o,name,material)
def cyl(name,p,r,depth,material):
    bpy.ops.mesh.primitive_cylinder_add(vertices=16,radius=r,depth=depth,location=pos(*p)); return add(bpy.context.object,name,material)
def text(body,p,size,material):
    bpy.ops.object.text_add(location=pos(*p),rotation=(math.pi/2,0,0)); o=bpy.context.object
    o.data.body=body; o.data.align_x='CENTER'; o.data.size=size; o.data.extrude=.003
    bpy.ops.object.convert(target='MESH'); return add(bpy.context.object,'Label_'+body,material)
def torus(name,p,r,minor,material):
    bpy.ops.mesh.primitive_torus_add(major_segments=24,minor_segments=6,location=pos(*p),major_radius=r,minor_radius=minor,rotation=(math.pi/2,0,0))
    return add(bpy.context.object,name,material)
def plant(x,z,scale=1):
    cyl('terracotta pot',(x,.26*scale,z),.25*scale,.50*scale,'coral')
    cyl('soil',(x,.52*scale,z),.23*scale,.04*scale,'oak_dark')
    cyl('stem',(x,.92*scale,z),.025*scale,.8*scale,'leaf')
    for i in range(7):
        a=i*2.4; o=ball('leaf',(x+math.cos(a)*.22*scale,(.65+i*.09)*scale,z+math.sin(a)*.22*scale),(.20*scale,.09*scale,.13*scale),'leaf_light' if i%2 else 'leaf'); o.rotation_euler[1]=a
def book(name,p,category=0,standing=True):
    colors=['sage','coral','gold','blue','rose','mint','yellow','oak','dark','cream']
    w,h,d=(.13,.48,.30) if standing else (.36,.075,.48)
    box(name,p,(w,h,d),colors[category%10])
    if standing: box('spine band',(p[0],p[1]+h*.22,p[2]+d/2+.003),(w*.8,.025,.006),'paper')
    else: box('pages',(p[0]+.004,p[1],p[2]),(w*.90,h*.64,d*.95),'paper')
colliders=[]; shelves=[]
box('foundation',(0,-.22,0),(26,.40,22),'oak_dark',.08)
box('floor',(0,-.015,0),(25.9,.08,21.9),'oak_light')
for z in range(44):
    box('plank seam',(0,.03,-10.75+z*.5),(25.8,.01,.012),'oak')
    for x in [-10,-4,2,8]: box('plank end',(x+(z%3)*1.1,.03,-10.5+z*.5),(.012,.012,.5),'oak')
box('back wall',(0,1.9,-10.9),(26,.18,3.9),'wall',.03)
box('west wall',(-12.9,1.5,-1.4),(.15,3,18.9),'wall')
box('east low wall',(12.9,.65,-1.4),(.15,1.3,18.9),'wall')
box('skirting',(0,.18,-10.72),(25.8,.24,.16),'sage')
for x in [-9,-4.5,0,4.5,9]:
    box('window frame',(x,2.05,-10.74),(2.7,2,.12),'cream',.03)
    box('window',(x,2.05,-10.65),(2.48,1.78,.035),'glass')
    box('mullion',(x,2.05,-10.60),(.08,1.8,.07),'cream')
    box('mullion',(x,2.05,-10.60),(2.5,.08,.07),'cream')
    box('sill',(x,1.13,-10.50),(2.9,.12,.44),'oak_light',.02)
text('THE LITTLE LIBRARY',(0,3.25,-10.70),.38,'sage')
for row,z in enumerate([-5.6,-1.0]):
    for col,x in enumerate([-9,-4.5,0,4.5,9]):
        n=row*5+col; code=f'{n*100:03d}'
        box('Shelf_'+code+'_back',(x,1.3,z),(2.7,2.5,.12),'oak')
        for dx in [-1.32,1.32]: box('Shelf_'+code+'_side',(x+dx,1.3,z),( .10,2.55,.84),'oak_light',.015)
        for y in [.15,.72,1.30,1.88,2.48]: box('Shelf_'+code+'_board',(x,y,z),(2.75,.095,.88),'oak_light',.01)
        box('Shelf_'+code+'_header',(x,2.58,z+.44),(2.78,.28,.10),'sage',.02)
        text(code,(x,2.50,z+.50),.24,'cream')
        for level,y in enumerate([.41,.99,1.57,2.15]):
            for b in range(15):
                if random.random()<.08: continue
                h=random.uniform(.33,.48); p=(x-1.19+b*.161,y+(h-.42)/2,z+.13)
                book('Shelf_'+code+'_book',p,n if random.random()<.7 else random.randrange(10))
        colliders.append({'id':'shelf-'+code,'x':x,'z':z,'w':2.85,'d':1.0})
        shelves.append({'code':code,'x':x,'z':z,'category':n})
box('exhibit rug',(-8,.041,3.5),(4.0,.026,3.0),'rug',.08)
box('exhibit plinth',(-8,.53,3.3),(2.8,1.02,1.0),'cream',.06)
box('exhibit top',(-8,1.08,3.3),(3.0,.10,1.2),'oak_light',.02)
for i in range(5): book('featured title',(-9.05+i*.52,1.33,3.3),i,True)
box('exhibit sign',(-8,1.85,2.92),(2.75,.62,.08),'sage',.025)
text('THIS MONTH',(-8,1.78,2.98),.25,'cream')
colliders.append({'id':'exhibition','x':-8,'z':3.3,'w':3.1,'d':1.3})
box('librarian desk',(-6.4,.60,7.4),(4.3,1.15,1.7),'sage',.08)
box('desk top',(-6.4,1.20,7.4),(4.55,.14,1.92),'oak_light',.045)
box('desk trim',(-6.4,.90,8.27),(3.9,.05,.03),'gold')
text('INFORMATION',(-6.4,.53,8.27),.26,'cream')
box('monitor base',(-6.2,1.31,7.36),(.64,.07,.38),'dark',.04)
box('monitor stand',(-6.2,1.59,7.40),(.08,.53,.10),'dark')
box('desk computer',(-6.2,1.81,7.40),(1.05,.64,.09),'dark',.045)
box('computer screen',(-6.2,1.81,7.46),(.93,.52,.014),'screen')
text('LIBRARY',(-6.2,1.78,7.47),.13,'paper')
box('keyboard',(-6.2,1.31,7.86),(.65,.045,.22),'cream',.01)
box('scanner',(-5.1,1.34,7.75),(.22,.13,.31),'dark',.03)
for i in range(3): book('desk book',(-7.65,1.35+i*.08,7.6),i,False)
cyl('mug',(-4.7,1.43,7.35),.10,.29,'coral')
colliders.append({'id':'desk','x':-6.4,'z':7.4,'w':4.55,'d':1.92})
box('return machine',(7.3,.88,6.7),(1.65,1.76,1.3),'cream',.10)
box('return fascia',(7.3,1.00,7.37),(1.39,1.28,.06),'sage',.04)
box('return slot',(7.3,.90,7.415),(1.04,.17,.025),'dark',.015)
box('return screen',(7.3,1.44,7.415),(.68,.33,.025),'screen',.02)
text('RETURN',(7.3,.55,7.42),.16,'cream')
colliders.append({'id':'return','x':7.3,'z':6.7,'w':1.8,'d':1.5})
box('return zone',(6.0,.038,7.0),(5,.015,4),'mint',.08)
# Reading area and quiet nook.
for x,z in [(8,2.5),(-9,-8.5),(9,-8.5)]:
    cyl('reading table',(x,.87,z),.78,.13,'oak_light')
    cyl('table leg',(x,.44,z),.10,.82,'sage')
    for dz in [-1.15,1.15]:
        box('chair seat',(x,.47,z+dz),(.65,.14,.62),'sage',.05)
        box('chair back',(x,.90,z+dz+(.26 if dz>0 else -.26)),(.65,.72,.10),'sage',.05)
        for dx in [-.23,.23]:
            for d in [-.20,.20]: box('chair leg',(x+dx,.24,z+dz+d),(.055,.45,.055),'oak')
    book('reading book',(x,.98,z),6,False)
    colliders.append({'id':'table','x':x,'z':z,'w':1.7,'d':3.2})
for x,z in [(-11.6,-9.8),(11.6,-9.8),(-11.6,7.7),(11.6,7.7),(-3.8,-9.8),(3.8,-9.8)]: plant(x,z,1.25)
box('entry mat',(0,.05,9.5),(4,.06,2),'sage',.08)
text('WELCOME',(0,.075,9.5),.30,'cream').rotation_euler=(0,0,0)
# Create a fully separate editable two-head-tall character, facing +Z in the game.
current='librarian'
ball('Body',(0,.57,0),(.30,.38,.22),'apron')
ball('Head',(0,1.29,0),(.46,.48,.40),'skin')
ball('Hair cap',(0,1.47,-.075),(.475,.33,.39),'hair')
ball('Bun',(0,1.52,-.40),(.23,.24,.20),'hair')
for x in [-.42,.42]: ball('Ear',(x,1.27,0),(.095,.12,.075),'skin')
for x in [-.19,.19]:
    torus('Glasses',(x,1.30,.361),.14,.016,'dark')
    ball('Eye',(x,1.29,.377),(.036,.052,.022),'dark')
    ball('Eye highlight',(x-.009,1.308,.397),(.009,.014,.006),'paper')
box('Glasses bridge',(0,1.31,.377),(.105,.016,.015),'dark')
ball('Nose',(0,1.22,.399),(.055,.042,.036),'skin')
box('Smile',(0,1.13,.385),(.09,.018,.014),'coral',.008)
for x in [-.30,.30]: ball('Cheek',(x,1.19,.337),(.066,.028,.014),'rose')
box('Apron pocket',(0,.52,.221),(.28,.17,.028),'mint',.035)
box('Name badge',(-.14,.76,.184),(.14,.09,.025),'cream',.01)
for x in [-.17,.17]:
    box('Apron strap',(x,.80,.17),(.065,.25,.045),'mint',.015)
for side,x in [('L',-.38),('R',.38)]:
    current='arm.'+side
    ball('Sleeve',(x,.75,0),(.115,.17,.12),'shirt')
    ball('Hand',(x,.53,.015),(.09,.14,.085),'skin')
for side,x in [('L',-.16),('R',.16)]:
    current='leg.'+side
    box('Leg',(x,.20,0),(.16,.23,.16),'shirt',.04)
    ball('Shoe',(x,.075,.060),(.135,.09,.19),'shoes')
current='cart'
for y in [.35,1.02]:
    box('Cart tray',(0,y,0),(1.14,.10,.77),'mint',.025)
    for x in [-.57,.57]: box('Tray side',(x,y+.07,0),(.05,.16,.80),'sage',.015)
    box('Tray back',(0,y+.07,-.38),(1.14,.16,.05),'sage',.015)
for x in [-.53,.53]:
    for z in [-.32,.32]:
        cyl('Cart post',(x,.69,z),.035,.85,'sage')
        o=cyl('Wheel',(x,.12,z),.12,.07,'dark'); o.rotation_euler[1]=math.pi/2
box('Cart handle',(0,1.23,-.44),(1.15,.055,.055),'oak_light',.02)
for x in [-.53,.53]: box('Handle post',(x,1.12,-.44),(.055,.24,.055),'sage',.015)
current='book'
book('Book',(0,.065,0),1,False)
# Consolidate static meshes by material; leave limbs as separate pivot objects.
def join_group(name,objects,pivot=(0,0,0)):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects: o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]; bpy.ops.object.join(); o=bpy.context.object; o.name=name
    bpy.context.scene.cursor.location=pos(*pivot); bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
    return o
roots={}
for group,objects in groups.items():
    root=bpy.data.objects.new(group+'_root',None); bpy.context.collection.objects.link(root); roots[group]=root
    if group=='library':
        buckets={}
        for o in objects: buckets.setdefault(o.data.materials[0].name,[]).append(o)
        for key,objs in buckets.items(): join_group('Library_'+key,objs).parent=root
    else:
        pivot=( -.38 if group=='arm.L' else .38,.83,0) if group.startswith('arm') else ((-.16 if group=='leg.L' else .16),.32,0) if group.startswith('leg') else (0,0,0)
        o=join_group(group,objects,pivot); o.parent=root
for group in ['arm.L','arm.R','leg.L','leg.R']:
    for o in list(roots[group].children):
        o.parent=roots['librarian']
    bpy.data.objects.remove(roots[group],do_unlink=True)
def select_root(root):
    root.select_set(True)
    for o in root.children_recursive: o.select_set(True)
for name in ['library','librarian','cart','book']:
    bpy.ops.object.select_all(action='DESELECT'); select_root(roots[name])
    bpy.ops.export_scene.gltf(filepath=os.path.join(ASSETS,name+'.glb'),export_format='GLB',use_selection=True,export_apply=True,export_extras=True)
# Lay out the source scene for editing and a thumbnail render.
roots['librarian'].location=pos(-3.5,0,6.8); roots['cart'].location=pos(4.9,0,6.3); roots['book'].location=pos(2,0,4)
bpy.ops.object.light_add(type='AREA',location=(0,-2,13)); bpy.context.object.data.energy=2100; bpy.context.object.data.shape='DISK'; bpy.context.object.data.size=12
bpy.ops.object.light_add(type='SUN',location=(0,0,10)); bpy.context.object.data.energy=1.8; bpy.context.object.rotation_euler=(.4,-.5,-.3)
bpy.ops.object.camera_add(location=pos(23,24,28)); camera=bpy.context.object
direction=Vector(pos(0,.6,0))-camera.location; camera.rotation_euler=direction.to_track_quat('-Z','Y').to_euler(); camera.data.type='ORTHO'; camera.data.ortho_scale=35
bpy.context.scene.camera=camera; bpy.context.scene.world.color=(.72,.78,.70)
scene=bpy.context.scene; scene.render.engine='CYCLES'; scene.cycles.samples=24; scene.cycles.use_denoising=False; scene.render.resolution_x=1440; scene.render.resolution_y=1080; scene.render.resolution_percentage=100
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'models','library.blend'))
with open(os.path.join(ASSETS,'layout.json'),'w') as f: json.dump({'shelves':shelves,'colliders':colliders,'desk':{'x':-6.4,'z':7.4},'return':{'x':7.3,'z':6.7},'cart':{'x':4.9,'z':6.3},'exhibition':{'x':-8,'z':3.3}},f,ensure_ascii=False,indent=2)
scene.render.filepath=os.path.join(ROOT,'models','preview.png'); bpy.ops.render.render(write_still=True)
print('ASSETS_READY',ASSETS)
