#![no_std]

multiversx_sc::imports!();

#[multiversx_sc::contract]
pub trait Contract {
    #[init]
    fn init(&self) {}

    #[upgrade]
    fn upgrade(&self) {}

    #[endpoint]
    fn calls_then_back_transfers(&self, to: ManagedAddress, egld_values: MultiValueEncoded<BigUint>) -> BigUint {
        for egld_value in egld_values {
            self.self_proxy(to.clone())
                .send_back_egld_value(egld_value.clone())
                .execute_on_dest_context::<()>();
        }
        self.blockchain().get_back_transfers().total_egld_amount
    }

    #[endpoint]
    fn send_back_egld_value(&self, egld_value: BigUint) {
        self.send().direct_egld(&self.blockchain().get_caller(), &egld_value);
    }

    #[proxy]
    fn self_proxy(&self, to: ManagedAddress) -> self::Proxy<Self::Api>;
}
