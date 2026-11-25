export type Scene = {
  n: string;
  hy?: number;
  h: number;
  vx: number;
  f0: [number, number];
  f1: [number, number];
  z: [number, number];
  k: [number, number];
  exp: number;
  tint: [number, number, number];
  haze: number;
  shim: number;
  kind: 0 | 1 | 2;
  dust?: number;
  ember?: number;
};

// h: horizon (from top). k: ground dolly strength. vx: vanishing point. kind: 0 day, 1 firelight, 2 stars.
export const SCENES: Scene[] = [
  { n: 'morning', h: .5, vx: .62, f0: [.62, .6], f1: [.62, .56], z: [1.0, 1.06], k: [0, .15], exp: 1, tint: [1, 1, 1], haze: .3, shim: .6, kind: 0, dust: .6 },
  { n: 'drive', h: .3, vx: .5, f0: [.5, .55], f1: [.55, .55], z: [1.0, 1.12], k: [0, .4], exp: 1, tint: [1, 1, 1], haze: .3, shim: .5, kind: 0, dust: 1 },
  { n: 'friends', h: .2, vx: .6, f0: [.6, .58], f1: [.64, .62], z: [1.0, 1.08], k: [0, .05], exp: 1, tint: [1, 1, 1], haze: .2, shim: 0, kind: 0, dust: .8 },
  { n: 'camel', h: .9, vx: .5, f0: [.5, .62], f1: [.52, .6], z: [1.04, 1.14], k: [0, 0], exp: 1, tint: [1, 1, 1], haze: 0, shim: 0, kind: 0, dust: .3 },
  { n: 'golden', h: .4, vx: .6, f0: [.5, .45], f1: [.5, .5], z: [1.0, 1.08], k: [0, .45], exp: 1, tint: [1, .98, .95], haze: .4, shim: .5, kind: 0, dust: .5 },
  { n: 'evening', h: .72, vx: .5, f0: [.5, .5], f1: [.5, .46], z: [1.0, 1.08], k: [0, .2], exp: .96, tint: [1, .96, .94], haze: .2, shim: .3, kind: 0, dust: .3 },
  { n: 'fireshow', h: .85, vx: .4, f0: [.45, .42], f1: [.45, .38], z: [1.0, 1.08], k: [0, 0], exp: 1, tint: [1, 1, 1], haze: 0, shim: 0, kind: 1, ember: 1 },
  { n: 'nightfire', h: .9, vx: .5, f0: [.5, .35], f1: [.5, .3], z: [1.02, 1.1], k: [0, 0], exp: 1, tint: [1, 1, 1], haze: 0, shim: 0, kind: 1, ember: .8 },
];

export const VERT = 'attribute vec2 a;varying vec2 v;void main(){v=vec2(a.x*.5+.5,.5-a.y*.5);gl_Position=vec4(a,0.,1.);}';

export const FRAG = [
  'precision highp float;',
  'varying vec2 v;uniform float T,M,E,D,W,S,H,SC,KA,KB;uniform vec2 R;uniform vec3 C;',
  'uniform sampler2D A,B,N;uniform vec4 XA,XB,GA,GB;',
  'float n2(vec2 p){return texture2D(N,p*.0078125).r;}',
  'float fbm(vec2 p){return .62*n2(p)+.38*n2(p*2.1+7.);}',
  'vec3 scene(sampler2D t,vec4 x,vec4 g,float kind){',
  ' vec2 p=x.xy+(v-.5)*x.zw;',
  ' float d=max(0.,(p.y-g.x)/(1.-g.x));float f=1./(1.+g.y*d);',
  ' p=vec2(g.z,g.x)+(p-vec2(g.z,g.x))*vec2(f,f);',
  ' if(kind<.5&&S>0.){float b=exp(-pow((p.y-g.x)*24.,2.));p.x+=b*sin(p.y*240.+T*2.6)*.0011*S;}',
  ' float w=0.;',
  ' if(kind>1.5){w=1.-smoothstep(.6,.82,p.y);vec2 q=p-vec2(.55,-.35);float a=g.w*w;float cs=cos(a),sn=sin(a);p=vec2(.55,-.35)+vec2(q.x*cs-q.y*sn,q.x*sn+q.y*cs);}',
  ' vec3 c=texture2D(t,p).rgb;float l=dot(c,vec3(.3,.59,.11));',
  ' if(kind>.5&&kind<1.5){float m=smoothstep(.35,.9,l)*smoothstep(.04,.3,c.r-c.b);float fl=.5*sin(T*7.)+.5*sin(T*13.3+1.)+n2(vec2(T*3.,1.))-.5;c*=1.+m*fl*.11;}',
  ' if(kind>1.5){float s=smoothstep(.62,.95,l)*w;c*=1.+s*(n2(p*150.+vec2(T*.9,-T*.7))-.5)*.5;}',
  ' return c;',
  '}',
  'void main(){',
  ' vec3 a=scene(A,XA,GA,KA),col=a;',
  ' if(W<1.){float dd=max(0.,(v.y-GA.x)/.75);float e=1.-smoothstep(W*1.5-.5,W*1.5,dd);float l=mix(.2,1.,max(e,W*W));l=dd<=0.?mix(.32,1.,W):l;col=mix(col*vec3(.45,.55,.95),col,l)*l;}',
  ' if(M>0.){vec3 b=scene(B,XB,GB,KB);float n=fbm(v*vec2(3.2,2.2)+vec2(T*.05,0.));float fr=v.x*.3+n*.7;float e=smoothstep(fr-.14,fr+.14,M*1.28-.14);col=mix(col,b,e);float band=e*(1.-e)*4.;col+=band*vec3(.42,.27,.13)*(1.-KB*.42)*.55;}',
  ' col*=E*C;col=mix(col,col*col*(3.-2.*col),.28);',
  ' if(H>0.){float n=fbm(v*vec2(2.2,7.)+vec2(T*.09,T*.012));col+=vec3(.5,.34,.18)*n*n*n*H*.2*smoothstep(.1,.7,v.y);}',
  ' vec2 u=v-.5;float vg=1.-smoothstep(.34,.86,length(u*vec2(1.05,1.)));col*=mix(.74,1.,vg);',
  ' col*=(1.-.62*SC*smoothstep(.4,1.,v.y))*(1.-.5*smoothstep(.83,1.,v.y));',
  ' col=mix(col,vec3(.051,.031,.075),D);',
  ' col+=(texture2D(N,v*R*.0078125+fract(T*vec2(13.7,7.3))).g-.5)*.05;',
  ' gl_FragColor=vec4(col,1.);',
  '}',
].join('\n');
