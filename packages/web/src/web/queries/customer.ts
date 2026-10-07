import {useQuery,useMutation,useQueryClient} from '@tanstack/react-query';
import {orpc} from '../lib/api';
export function useProfile(enabled:boolean){return useQuery(orpc.customer.profile.queryOptions({enabled,retry:false}));}
export function useSaveProfile(){const qc=useQueryClient();return useMutation(orpc.customer.save.mutationOptions({onSuccess:()=>qc.invalidateQueries({queryKey:orpc.customer.profile.key()})}));}
