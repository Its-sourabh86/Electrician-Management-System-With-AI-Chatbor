package in.sourabh.electrician.mapper;

import in.sourabh.electrician.dto.ElectricianDto;
import in.sourabh.electrician.entites.Electrician;

public class ElectricianMapper {

    public static ElectricianDto mapToElectricianDto(Electrician electrician) {
        return new ElectricianDto(
                electrician.getId(),
                electrician.getName(),
                electrician.getEmail(),
                electrician.getPassword(),
                electrician.getMobileNumber(),
                electrician.getExperience(),
                electrician.getImageProfile(),
                electrician.getLocation(),
                electrician.getDegree(),
                electrician.getRole());
    }

    public static Electrician mapToElectrician(ElectricianDto electricianDto) {
        return new Electrician(
                electricianDto.getId(),
                electricianDto.getName(),
                electricianDto.getEmail(),
                electricianDto.getPassword(),
                electricianDto.getMobileNumber(),
                electricianDto.getExperience(),
                electricianDto.getImageProfile(),
                electricianDto.getLocation(),
                electricianDto.getDegree(),
                electricianDto.getRole());
    } // <-- Added missing closing brace for method
} // <-- Added missing closing brace for class