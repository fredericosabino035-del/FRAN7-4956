import { useQuery,useMutation,useQueryClient } from '@tanstack/react-query';
import { orpc } from '../lib/api';
export function useProducts(){return useQuery(orpc.store.list.queryOptions());}
export function useAccess(enabled:boolean){return useQuery(orpc.store.access.queryOptions({enabled,retry:false}));}
export function useUpdateProduct(){const qc=useQueryClient();return useMutation(orpc.store.update.mutationOptions({onSuccess:()=>qc.invalidateQueries({queryKey:orpc.store.list.key()})}));}
export function useComments(productId:number){return useQuery(orpc.store.comments.queryOptions({input:{productId}}));}
export function useComment(){const qc=useQueryClient();return useMutation(orpc.store.comment.mutationOptions({onSuccess:()=>qc.invalidateQueries({queryKey:orpc.store.comments.key()})}));}
export function useRemoveComment(){const qc=useQueryClient();return useMutation(orpc.store.removeComment.mutationOptions({onSuccess:()=>qc.invalidateQueries({queryKey:orpc.store.comments.key()})}));}
