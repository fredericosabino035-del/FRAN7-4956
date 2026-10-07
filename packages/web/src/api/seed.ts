import { db } from './database';
import { products } from './database/schema';
export async function seed(){
 if((await db.select().from(products).limit(1)).length)return;
 await db.insert(products).values([
 {name:'T-shirt Legacy',price:8500,image:'/images/legacy.jpg',category:'Unissexo',kind:'T-shirts',sizes:'S,M,L,XL',description:'Uma peça com identidade FRAN7. Design preto com assinatura da marca e detalhe lateral.'},
 {name:'T-shirt Urban',price:7000,image:'/images/urban.jpg',category:'Unissexo',kind:'T-shirts',sizes:'S,M,L,XL',description:'O teu estilo, sem limites. T-shirt preta com grafismo FRAN7.'},
 {name:'T-shirt Essential',price:7000,image:'/images/essential.jpg',category:'Unissexo',kind:'T-shirts',sizes:'S,M,L,XL',description:'Uma assinatura discreta para o dia a dia. T-shirt preta com logótipo FRAN7.'},
 {name:'T-shirt White Edition',price:8500,image:'/images/white.jpg',category:'Unissexo',kind:'T-shirts',sizes:'S,M,L,XL',description:'Uma nova perspetiva sobre os essenciais. T-shirt clara com assinatura FRAN7.'},
 {name:'Boné Signature Black',price:5000,image:'/images/cap-black.jpg',category:'Unissexo',kind:'Bonés',sizes:'Único',description:'Completa o teu estilo com a assinatura 7 em preto.'},
 {name:'Boné Signature Brown',price:5000,image:'/images/cap-brown.jpg',category:'Unissexo',kind:'Bonés',sizes:'Único',description:'A assinatura 7 numa tonalidade castanha.'},
 ]);
}
